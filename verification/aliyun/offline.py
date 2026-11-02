"""Runner-only orchestration: prepare inputs, then execute repository code offline."""
import json
import os
from pathlib import Path
import shutil
import selectors
import time
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
RESULTS = ROOT / 'verification/aliyun/results/offline'
RESULTS.mkdir(parents=True, exist_ok=True)
BASE = '69695eb6c456e10e9252ac1dcd01fd6a195c397b'
IMAGE = 'node:22.23.4-bookworm-slim'
report = {'baseline': BASE, 'image': IMAGE, 'status': 'failed'}


def host(command):
    return subprocess.run(command, cwd=ROOT, check=True, text=True, capture_output=True, timeout=120).stdout


try:
    host(['docker', 'pull', IMAGE])
    report['image_id'] = host(['docker', 'image', 'inspect', IMAGE, '--format', '{{.Id}}']).strip()
    with tempfile.TemporaryDirectory(prefix='aliyun183-') as directory:
        inputs = Path(directory) / 'input'
        inputs.mkdir()
        for name in ['src', 'test', 'scripts', 'node_modules']:
            shutil.copytree(ROOT / name, inputs / name, symlinks=False)
        for name in ['package.json', 'package-lock.json', 'userscript.js']:
            shutil.copyfile(ROOT / name, inputs / name)
        baseline = inputs / 'baseline'
        for name in ['src/handlers/forums.js', 'src/rules/custom.js', 'src/userscript.meta.txt', 'userscript.js']:
            target = baseline / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(host(['git', 'show', f'{BASE}:{name}']))
        # Only selected source/dependencies are mounted. No .git, credentials,
        # runner environment, Docker socket, or retained output directory.
        command = [
            'docker', 'run', '--rm', '--name', 'aliyun183-offline',
            '--network=none', '--ipc=none', '--log-driver=none', '--read-only', '--cap-drop=ALL',
            '--security-opt=no-new-privileges', '--user=1000:1000',
            '--memory=512m', '--memory-swap=512m', '--pids-limit=128', '--cpus=1',
            '--cpuset-cpus', str(min(os.sched_getaffinity(0))),
            '--ulimit=cpu=60:60', '--ulimit=fsize=16777216:16777216',
            '--ulimit=nofile=128:128', '--ulimit=core=0:0',
            '--tmpfs=/scratch:rw,nosuid,nodev,size=128m,uid=1000,gid=1000,mode=700',
            '--mount', f'type=bind,src={inputs},dst=/input,readonly',
            '--workdir=/scratch', IMAGE,
            'env', '-i', 'PATH=/usr/local/bin:/usr/bin:/bin',
            'HOME=/scratch/home', 'TMPDIR=/scratch/tmp',
            'npm_config_cache=/scratch/cache', 'npm_config_logs_max=0',
            'npm_config_update_notifier=false',
            'sh', '-eu', '-c', r'''
mkdir home tmp cache
node -e '
const fs=require("fs"), assert=require("assert/strict"), os=require("os");
const read=p=>fs.readFileSync(p,"utf8").trim();
assert.equal(read("/sys/fs/cgroup/memory.max"),"536870912");
assert.equal(read("/sys/fs/cgroup/memory.swap.max"),"0");
assert.equal(read("/sys/fs/cgroup/pids.max"),"128");
assert.equal(read("/sys/fs/cgroup/cpu.max"),"100000 100000");
assert.deepEqual(Object.keys(os.networkInterfaces()),["lo"]);
for(const p of ["/input/package.json","/usr/local/bin/readonly-probe"]){
  assert.throws(()=>fs.openSync(p,"a"),e=>e.code==="EROFS" || e.code==="EACCES");
}
const disk=fs.statfsSync("/scratch");assert(disk.blocks*disk.bsize<=134217728);
console.log("SANDBOX_CONTROLS_VERIFIED", JSON.stringify({memory:read("/sys/fs/cgroup/memory.max"),pids:read("/sys/fs/cgroup/pids.max"),cpu:read("/sys/fs/cgroup/cpu.max"),disk:disk.blocks*disk.bsize,environment:Object.keys(process.env).sort()}));
'
cp -R /input/src /input/test /input/scripts .
cp /input/package.json /input/package-lock.json /input/userscript.js .
ln -s /input/node_modules node_modules
cp /input/baseline/src/handlers/forums.js src/handlers/forums.js
cp /input/baseline/src/rules/custom.js src/rules/custom.js
cp /input/baseline/src/userscript.meta.txt src/userscript.meta.txt
cp /input/baseline/userscript.js userscript.js
set +e
node --test --test-name-pattern='Aliyun keeps external anchor activation native: https://www.gov.cn/' test/aliyun.test.js > baseline.tap 2>&1
baseline_status=$?
set -e
cat baseline.tap
# Require six intended assertions to fail; dependency/syntax/runner failures
# cannot masquerade as the expected regression.
test "$baseline_status" -eq 1
grep -q '^# fail 6$' baseline.tap
grep -q 'ERR_ASSERTION' baseline.tap
printf 'BASELINE_EXPECTED_FAILURE_VERIFIED\n'
cp /input/src/handlers/forums.js src/handlers/forums.js
cp /input/src/rules/custom.js src/rules/custom.js
cp /input/src/userscript.meta.txt src/userscript.meta.txt
cp /input/userscript.js userscript.js
node --test test/aliyun.test.js
npm run build
cmp userscript.js /input/userscript.js
npm run check
printf 'FIXED_BUILD_AND_CHECK_VERIFIED\n'
''']
        # Parent captures bounded text only; target has no retained-artifact mount.
        process = subprocess.Popen(command, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        selector = selectors.DefaultSelector()
        selector.register(process.stdout, selectors.EVENT_READ)
        chunks = []
        size = 0
        deadline = time.monotonic() + 150
        try:
            while selector.get_map():
                if time.monotonic() > deadline:
                    raise TimeoutError('Offline container exceeded 150-second wall limit')
                for key, _ in selector.select(timeout=1):
                    chunk = os.read(key.fileobj.fileno(), 65536)
                    if not chunk:
                        selector.unregister(key.fileobj)
                        continue
                    size += len(chunk)
                    if size > 1024 * 1024:
                        raise RuntimeError('Evidence exceeds 1 MiB bound')
                    chunks.append(chunk)
            process.wait(timeout=10)
        except Exception:
            subprocess.run(['docker', 'rm', '-f', 'aliyun183-offline'], timeout=20, check=False)
            process.kill()
            process.wait(timeout=10)
            raise
        finally:
            selector.close()
            output = b''.join(chunks).decode('utf-8', errors='replace')
            (RESULTS / 'checks.log').write_text(output)
        # Container and all its descendants have exited before retaining output.
        report['exit_code'] = process.returncode
        for marker in ['SANDBOX_CONTROLS_VERIFIED', 'BASELINE_EXPECTED_FAILURE_VERIFIED', 'FIXED_BUILD_AND_CHECK_VERIFIED']:
            report[marker] = marker in output
        print(output)
        if process.returncode or not all(report[x] for x in ['SANDBOX_CONTROLS_VERIFIED', 'BASELINE_EXPECTED_FAILURE_VERIFIED', 'FIXED_BUILD_AND_CHECK_VERIFIED']):
            raise RuntimeError('Offline regression/check failed; see checks.log')
        report['status'] = 'passed'
except Exception as error:
    report['error'] = str(error)
    raise
finally:
    (RESULTS / 'summary.json').write_text(json.dumps(report, indent=2) + '\n')

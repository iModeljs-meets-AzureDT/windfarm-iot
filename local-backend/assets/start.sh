#!/bin/bash
node main.js &
process_id=$!
wait $!
exit_code=$?
crashpad_pid="$(pidof /app/node_modules/@bentley/imodeljs-native/imodeljs-linux-x64/CrashpadHandler)"
if [ -n "$crashpad_pid" ]
then
  echo "=== CRASH DETECTED ==="
  echo "Waiting for crashpad process to finish..."
  while ps -p $crashpad_pid > /dev/null; do sleep 1; done;
fi
echo "Exiting with code $exit_code"
exit $exit_code

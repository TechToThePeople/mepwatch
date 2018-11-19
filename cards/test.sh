

for entry in ./*.json
do
  if ! jq -e . $entry > /dev/null 2>&1; then
#    echo "$entry fine"
#  else
    echo "$entry not fine"

  fi
done



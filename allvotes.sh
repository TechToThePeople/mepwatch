#quick hack, it should be better to modify the node script to generate the files too
ids=$(q "select identifier from parlparse/data/item_rollcall.csv" -d, -H)
for i in $ids ; do
    echo "File not found! $i"
    q "select voteid,name,status,'manual',$i as result from cards/$i.attendance.csv left join data/meps.csv on id=epid left join cards/$1.csv on mepid=voteid where result is null" -d, -H >> "cards/$i.csv"
#    bash vote.sh $i
  if [ ! -f "cards/$i.csv" ]; then
  fi
done

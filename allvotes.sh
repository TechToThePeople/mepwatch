#quick hack, it should be better to modify the node script to generate the files too
ids=$(q "select identifier from parlparse/data/item_rollcall.csv" -d, -H)
for i in $ids ; do
#  q "select voteid,name,status,'manual',$i from cards/$i.attendance.csv left join data/meps.csv on id=epid left join cards/$i.csv on mepid=voteid where result is null" -d, -H  >> cards/$i.csv

  if [ ! -f "cards/$i.csv" ]; then
    echo "going for $i"
    bash vote.sh $i
#    echo "File not found! $i"
  fi
done

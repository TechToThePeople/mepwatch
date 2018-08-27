#quick hack, would be obviously better to start from the xml and/or generate dynamically
# eg vote.sh 92926
if [ -z "$1" ]; then
  echo "missing vote id";
  echo "usage: vote.sh {voteid} {YYYY-MM-DD}"
  exit 1
fi
datev=$(q "select substr(date,1,10) from parlparse/data/item_rollcall.csv where identifier=$1" -d, -H)
if [ -z "$datev" ]; then
  echo "missing vote date $datev";
  q "select * from parlparse/data/item_rollcall.csv where identifier=$1" -d, -O -H
  echo "usage: vote.sh {voteid} {YYYY-MM-DD}"
  exit 1
fi
echo "generating vote card for $1 voted on $datev"

echo "mepid,mep,result,group,identifier" > "cards/$1.csv"
ag --nonumbers $1 parlparse/data/mep_rollcall.csv >> "cards/$1.csv"

#deal with item_rollcall.csv
q "select identifier,date,report,desc,title,for,against,abstention from parlparse/data/item_rollcall.csv where identifier=$1" -d, -H | while IFS="," read identifier date report desc title vfor against abstention
do 
printf "{\"id\":$1,\n\"date\":\"$date\",\n\"report\":\"$report\",\n\"name\":\"CHANGE ME\",\n\"rapporteur\":\"RAPPORTEUR\",\n\"desc\":\"$desc\",\n\"for\":$vfor,\"against\":$against,\"abstention\":$abstention}\n" > "cards/$1.json"
cat cards/$1.json
done
#cp parlparse/data/meps.csv data/

# where they present or excused?

q "select * from parlparse/data/mep_attendance.csv where date='$datev'" -d, -H -O > "cards/$1.attendance.csv"
q "select voteid,name,status,'manual',$1 as result from cards/$1.attendance.csv left join data/meps.csv on id=epid left join cards/$1.csv on mepid=voteid where result is null" -d, -H >> "cards/$1.csv"


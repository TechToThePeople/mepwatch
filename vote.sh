echo "mepid,mep,result,group,identifier" > cards/92926.csv
ag --nonumbers 92926 parlparse/data/mep_rollcall.csv >> cards/92926.csv
#deal with item_rollcall.csv
q 'select * from parlparse/data/item_rollcall.csv where identifier=92926' -d, -O -H
echo "{id:92926,date:"yyyy-mm-dd"} > cards/92926.json
#cp parlparse/data/meps.csv data/

# where they present or excused?

q 'select * from parlpase/data/mep_attendance.csv where date="2018-07-05"' -d, -H -O > cards/92926.attendance.csv
q 'select voteid,name,status,"manual",92926 as result from cards/92926.attendance.csv left join data/meps.csv on id=epid left join cards/92926.csv on mepid=voteid where result is null' -d, -H >> cards/92926.csv


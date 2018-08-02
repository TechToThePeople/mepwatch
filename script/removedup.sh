q "select v.* from data/ep_votes.csv v join "<(q "select id,count(*) as c from data/ep_votes.csv group by id " -d, -H -O )" as t on v.id=t.id where c < 2" -d, -H -O > data/8term.csv
q "select v.* from data/ep_votes.csv v join "<(q "select id,count(*) as c from data/ep_votes.csv group by id " -d, -H -O )" as t on v.id=t.id where c >= 2 and report is not '' " -d, -H -O >> data/8term.csv

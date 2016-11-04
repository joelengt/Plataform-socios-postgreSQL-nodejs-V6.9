
# create database
psql -h localhost -p 5432 -U postgres caballeria < ./init/create_db.sql

# create tables
psql -h localhost -p 5432 -U postgres caballeria < ./init/create_tables.sql

# insert content
#psql -h localhost -p 5432 -U postgres caballeria < ./insert_address/insert_md_country.sql

#export PATH="/Library/PostgreSQL/9.6/bin:$PATH"
#psql -h localhost -p 5432 -U postgres caballeria

#postgres:@localhost:5432/caballeria

#local: 'postgres://postgres:@localhost:5432/caballeria',
#local_mac: 'postgres://joelengt:kuroyukihime2110@localhost:4002/caballeria'

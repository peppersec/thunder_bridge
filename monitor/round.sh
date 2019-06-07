#!/bin/bash
node checkWorker.js token1.config token1
node checkWorker2.js token1.config token1
node checkWorker.js token2.config token2
node checkWorker2.js token2.config token2


mv responses/validators.dat responses/validators_final.dat
mv responses/eventsStats.dat responses/eventsStats_final.dat
mv responses/alerts.dat responses/alerts_final.dat
mv responses/getBalances.dat responses/getBalances_final.dat


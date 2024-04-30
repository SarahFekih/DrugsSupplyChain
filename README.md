# SAFE DRUGS
Ce répertoire contient les fichiers nécessaires pour exécuter notre application de gestion des chaîne d'approvisionnement des médicaments implémentée sur le réseau Hyperledger Fabric.

## Mettre en place le Réseau
Pour mettre en place le réseau HLF, on doit: 
mettre en marche les organisations,
créer le canal, joindre tous les organisations au canal,
et déployer le chaincode.

Il faut donc exécuter les commandes suivantes:
```bash
cd test-network
./network.sh up -ca
./network.sh createChannel -ca
./network.sh deployCC -ccn fabcar -ccp ../chaincode/fabcar/go -ccl go
```

## Chainecode
Le chemin du chaincode est : chaincode/fabcar/go/MedicalSupplyChain.go

## Démarrer le serveur
Pour démarrer le serveur web, il faut créer la base de données: 
```bash
sudo service mongodb start
use testDB
```
Puis, il faut exécuter les commandes suivantes:
```bash
cd apiserver
npm install
node enrollAdmin
node registerUser
node server.js 
```

## Démarrer le Frontend
Pour démarrer le Frontend, il faut d'exécuter les commandes suivantes:
```bash
cd Front
npm install
npm start
```

## Démarrer le Hyperledger Caliper
Pour faire l'évaluation des performances, il suffit de jouer sur les paramètres dans le fichier:
\caliper-benchmarks-local\benchmarks\scenario\simple\MyApp\config.yaml
et il faut exécuter les commandes suivantes:
```bash
cd CaliperRepo
npm install 
docker-compose up
```



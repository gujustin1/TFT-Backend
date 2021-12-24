import admin from 'firebase-admin';
import cors from 'cors';
import express from 'express';

const serviceAcount = require('./secret_stuff/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAcount),
});

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const db = admin.firestore();

type Recommender = {
    item: string;
    champions: string[];
}

type RecommenderWithID = Recommender & {
    id: string;
}

export const champions = db.collection('champions');
export const items = db.collection('items');

app.get('/recommendChamps/:item', async (req, res) => {
    const item: string = req.params.item;
    const champsData = (await items.doc(item).get()).data();
    res.send(champsData);
})

app.get('/getRecommenders', async (req, res) => {
    const itemsSnapshot = await items.get();
    const allItemDocs = itemsSnapshot.docs;
    const list: Recommender[] = [];
    for (let doc of allItemDocs) {
        const item: RecommenderWithID = doc.data() as RecommenderWithID;
        item.id = doc.id;
        list.push(item);
  }
  res.send(list);
})

app.get('/recommendItems/:champion', async (req, res) => {
    const champion: string = req.params.champion;
    const itemsData = (await champions.doc(champion).get()).data();
    res.send(itemsData);
})

app.listen(port, () => {
    console.log('tft champ recommender listening on port: ', port);
})


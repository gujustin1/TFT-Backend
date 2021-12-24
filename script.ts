import champReader from 'fs';
import csv from 'csv-parser';
import { Champ } from './types';
import { champions, items } from './server';

let champsCSV: any[] = [];

champReader
    .createReadStream('./data_assets/tftchamps.csv')
    .pipe(csv())
    .on('data', (data) => champsCSV.push(data))
    .on('end', () => {
        console.log(champsCSV);
        const formattedChamps: Champ[] = [];
        for (let i = 0; i < champsCSV.length; i++) {
            let currChamp: Champ = { name: champsCSV[i].name, items: [champsCSV[i].item1, champsCSV[i].item2, champsCSV[i].item3] };
            formattedChamps.push(currChamp);
        }
        console.log(formattedChamps);
        pushToDatabase(formattedChamps);
        pushItemsToDatabase(getItemMap(formattedChamps));
    });

function pushToDatabase(champs: Champ[]) {
    for (let i = 0; i < champs.length; i++) {
        const currChamp = champions.doc(champs[i].name);
        currChamp.set({ items: champs[i].items });
    }
}

function getItemMap(champs: Champ[]) {
    const itemMap = new Map<string, string[]>();
    for (let i = 0; i < champs.length; i++) {
        let currName = champs[i].name;
        let currItems: string[] = champs[i].items;
        for (let j = 0; j < currItems.length; j++) {
            let currChamps: string[] | undefined = itemMap.has(currItems[j]) ? itemMap.get(currItems[j]) : [];
            if (currChamps !== undefined) {
                currChamps.push(currName);
                itemMap.set(currItems[j], currChamps);
            }
        }
    }
    console.log(itemMap);
    return itemMap;
}

function pushItemsToDatabase(itemsMap: Map<string, string[]>) {

    for (let entry of itemsMap.entries()) {
        const currItem = items.doc(entry[0]);
        console.log(currItem);
        currItem.set({ item: entry[0], champions: entry[1] })
    }

}

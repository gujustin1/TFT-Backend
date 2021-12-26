import champReader from 'fs';
import csv from 'csv-parser';
import { Champ } from './types';
import { champions, items } from './server';

let champsCSV: any[] = [];

champReader
    .createReadStream('./data_assets/tftchamps4.csv')
    .pipe(csv())
    .on('data', (data) => champsCSV.push(data))
    .on('end', () => {
        //console.log(champsCSV);
        const formattedChamps: Champ[] = [];
        const componentMap = new Map<string, string[]>();
        for (let i = 0; i < champsCSV.length; i++) {
            let items = champsCSV[i].items.split(',');
            //let currChamp: Champ = { name: champsCSV[i].name, items: [champsCSV[i].item1, champsCSV[i].item2, champsCSV[i].item3] };
            let currChamp: Champ = { name: champsCSV[i].name, items: items, image: champsCSV[i].image};

            let item = champsCSV[i].item;
            let c1 = champsCSV[i].component1;
            let c2 = champsCSV[i].component2;
            let components: string[] = [];
            components.push(c1);
            components.push(c2);
            componentMap.set(item, components);
            formattedChamps.push(currChamp);
        }
        //console.log(formattedChamps);
        //console.log(componentMap);
        pushToDatabase(formattedChamps);
        pushItemsToDatabase(getItemMap(formattedChamps), componentMap);
    });

function pushToDatabase(champs: Champ[]) {
    for (let i = 0; i < champs.length; i++) {
        const currChamp = champions.doc(champs[i].name);
        currChamp.set({ champion: champs[i].name, items: champs[i].items, image: champs[i].image});
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

function pushItemsToDatabase(itemsMap: Map<string, string[]>, componentMap: Map<string, string[]>) {

    for (let entry of itemsMap.entries()) {
        const currItem = items.doc(entry[0]);
        //console.log(currItem);
        let components = componentMap.get(entry[0]) as string[];

        currItem.set({ item: entry[0], champions: entry[1], component1: components[0], component2: components[1] })
        

    }

}

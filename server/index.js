import express from 'express';
import { FieldValue, Firestore } from '@google-cloud/firestore';
import cors from 'cors';
const app = express();
const PORT = parseInt(process.env.VITE_PORT || '8080');
const openRouter = express.Router();
app.use(cors());
const db = new Firestore({
    projectId: 'license2plate-b4c6e',
    keyFilename: process.env.KEY_FILE_PATH
});
openRouter.get('/', (req, res) => {
    //const name = process.env.NAME || 'World'
    res.send(`Hello ${req.ip}!`);
});
openRouter.get('/plates', async (req, res) => {
    const snapshot = await db.collection('plates').get();
    if (snapshot.empty) {
        res.json([]);
    }
    let plates = [];
    snapshot.forEach((plate) => {
        const p = plate.data();
        if (p.id == undefined) {
            const temp = {
                id: plate.id,
                voteCount: 0,
                uploader: 'garlicgirl'
            };
            plate.ref.set(temp);
            plates.push(temp);
        }
        else {
            plates.push(p);
        }
    });
    //snapshot.forEach((p) => plates.push(p.data() as IPlateCard))
    res.json(plates);
});
openRouter.post('/vote/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`${id} has been voted`);
    const docRef = db.collection('plates').doc(id);
    const { exists } = await docRef.get();
    try {
        // if (!exists) {
        //   await docRef.set({
        //     id,
        //     voteCount: 0,
        //     uploader: 'garlicgirl'
        //   })
        // }
        await docRef.collection('votes').add({ time: Date.now() });
        await docRef.update({
            voteCount: FieldValue.increment(1)
        });
    }
    catch (error) {
        console.log(error);
    }
    //const snapshot = await docRef.get()
    // if (docRef.) {
    //   await docRef.set(snapshot.data().id + 1)
    // }
    res.send(id);
});
app.use('/api', openRouter);
app.listen(PORT, () => {
    console.log(`helloworld: listening on port ${PORT}`);
});

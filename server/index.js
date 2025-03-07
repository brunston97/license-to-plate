import 'dotenv/config';
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
    res.send(`Hello ${req.ip}!`);
});
openRouter.post('/vote/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`${id} has been voted`);
    const docRef = db.collection('plates').doc(id);
    try {
        await docRef.collection('votes').add({ time: Date.now() });
        await docRef.update({
            voteCount: FieldValue.increment(1)
        });
    }
    catch (error) {
        console.log(error);
    }
    res.send(id);
});
openRouter.get('/vote/results', async (req, res) => {
    const docRef = db.collection('plates').orderBy('voteCount', 'desc').limit(24);
    try {
        const querySnapshot = await docRef.get();
        const results = querySnapshot.docs.map((doc) => {
            const toReturn = doc.data();
            console.log(toReturn);
            return toReturn;
        });
        res.json(results);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
app.use('/api', openRouter);
app.listen(PORT, () => {
    console.log(`helloworld: listening on port ${PORT}`);
});

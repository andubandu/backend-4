const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');
const app = express();
const FILE_PATH = './products.json';

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
    res.render('index'); 
});

app.get('/item/:id', async (req, res) => {
    res.render('item'); 
});

app.get('/products', async (req, res) => {
    const products = await fs.readFile(FILE_PATH, 'utf8').then(JSON.parse);
    res.json(products);
});

app.get('/createProduct', async (req, res) => {
    res.render('createProduct'); 
});

app.get('/products/:id', async (req, res) => {
    const products = await fs.readFile(FILE_PATH, 'utf8').then(JSON.parse);
    const product = products.find(p => p.id === +req.params.id);
    product ? res.json(product) : res.status(404).send('Product not found');
});

app.post('/products', async (req, res) => {
    const { name, img, price, description } = req.body;
    if (!name || !img || typeof price !== 'number' || !description) return res.status(400).send('Invalid product data');
    
    const products = await fs.readFile(FILE_PATH, 'utf8').then(JSON.parse);
    const newProduct = { ...req.body, id: (products.at(-1)?.id || 0) + 1 };
    products.push(newProduct);
    await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
});

app.put('/products/:id', async (req, res) => {
    if ('price' in req.body && typeof req.body.price !== 'number') return res.status(400).send('Price must be a number');
    
    const products = await fs.readFile(FILE_PATH, 'utf8').then(JSON.parse);
    const index = products.findIndex(p => p.id === +req.params.id);
    if (index === -1) return res.status(404).send('Product not found');
    
    products[index] = { ...products[index], ...req.body };
    await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2));
    res.json(products[index]);
});

app.delete('/products/:id', async (req, res) => {
    const products = await fs.readFile(FILE_PATH, 'utf8').then(JSON.parse);
    const index = products.findIndex(p => p.id === +req.params.id);
    if (index === -1) return res.status(404).send('Product not found');
    
    const [deletedProduct] = products.splice(index, 1);
    await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2));
    res.status(204).json(deletedProduct);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

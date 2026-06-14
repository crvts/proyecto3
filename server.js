const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());


// ─── SERVIR FRONTEND ────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));


// Ruta principal para abrir la página
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// ─── CONEXIÓN A MONGODB ATLAS ───────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err));


// ─── MODELO PRODUCTO ────────────────────────────────
const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  existencia: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Producto = mongoose.model('Producto', ProductoSchema);


// ─── CRUD ───────────────────────────────────────────


// CREATE
app.post('/productos', async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();

    res.status(201).json({
      mensaje: 'Producto registrado',
      producto: nuevo
    });

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});

// READ
app.get('/productos', async (req, res) => {
  try {

    const productos = await Producto.find()
      .sort({ createdAt: -1 });

    res.json(productos);
  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

// UPDATE
app.put('/productos/:id', async (req, res) => {
  try {
    const actualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new:true,
        runValidators:true
      }
    );


    if(!actualizado){

      return res.status(404).json({
        error:'Producto no encontrado'
      });

    }


    res.json({
      mensaje:'Producto actualizado',
      producto:actualizado
    });


  } catch(err){

    res.status(400).json({
      error:err.message
    });

  }
});

// DELETE
app.delete('/productos/:id', async (req,res)=>{

  try{

    const eliminado =
    await Producto.findByIdAndDelete(req.params.id);


    if(!eliminado){

      return res.status(404).json({
        error:'Producto no encontrado'
      });

    }


    res.json({
      mensaje:'Producto eliminado'
    });


  }catch(err){

    res.status(500).json({
      error:err.message
    });

  }
});

// ─── SERVIDOR ───────────────────────────────────────

const PORT = process.env.PORT || 3000;


app.listen(PORT, ()=>{

 console.log(`🚀 Servidor activo en puerto ${PORT}`);

});
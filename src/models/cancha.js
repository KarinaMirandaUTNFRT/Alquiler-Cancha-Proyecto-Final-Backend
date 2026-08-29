import mongoose, { Schema } from "mongoose";

const canchaSchema = new Schema(
    {
        
           nombreCancha:{
            type: String,
             required: true,
             unique: true,
             minlength:5, 
             maxlength:100,
             trim: true,
                },
    precio:{type: Number, 
        required: true, 
        min: 50, 
    },
    imagen:{ 
        type: String, 
        required: true, 
        validate: (valor) => /^https:\/\/.+\.(jpg|jpeg|png|webp|avif|svg)$/.test(valor),
    },
    categoria:{
        type: Schema.Types.ObjectId, 
        required: true,     
        ref: "categoriaCancha",
},
    descripcion: { 
        
        type: String,  
        minlength: 10, 
        maxlength:500, 
        required: true,
    },

},
{
    timpestamps: true
}
);
const Cancha = mongoose.modelo('cancha', canchaSchema) 
export default Cancha

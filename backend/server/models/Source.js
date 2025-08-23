const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true,
        trim: true
    },
      logoUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^(http|https):\/\/[^\s$.?#].[^\s]*$/.test(v);
            },
            message: props => `${props.value} is not a valid logo URL!`
        }
    },
    url: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^(http|https):\/\/[^\s$.?#].[^\s]*$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
     mediaBias: {
        type: String,
        enum: [
            'center','Unknown','lean left', 'left',  'lean right', 'right',
            
          ] ,
        default: 'Unknown' 
    },
    relatedCountry: {
        type: String,
        trim: true,
        default: 'Unknown'
    },
    type: {
        type: String,
        enum: [
            'Website','Youtube','Telegram','Blog','Podcast','Television','Radio'
          ] ,
        default: 'Unknown'
    },
    category: {
        type: String,
        enum: [
            'Politics', 
            'Technology', 
            'Sports', 
            'Health', 
            'Business', 
            'Entertainment', 
            'Science', 
            'World', 
            'Environment',
            'Lifestyle', 
            'Animals',
            'CryptoCurrencies',
            'Gaming',  
            'Education',
            'Culture'
        ],
        default: 'Unknown'
    },
    language: {
        type: String,
        default: 'english',
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Source', SourceSchema);

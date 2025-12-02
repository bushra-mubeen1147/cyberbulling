# Place Your Trained Model Files Here

This directory is where you should place your trained cyberbullying detection model files.

## Supported File Types:

### Scikit-learn Models:
- `*.pkl` - Pickled scikit-learn models
- `*.joblib` - Joblib serialized models

### BERT/Transformer Models:
- `config.json` - Model configuration
- `pytorch_model.bin` - PyTorch weights
- `vocab.txt` - Vocabulary file
- `tokenizer_config.json` - Tokenizer configuration
- `special_tokens_map.json` - Special tokens mapping

### TensorFlow/Keras Models:
- `*.h5` - Keras model files
- `*.pb` - TensorFlow SavedModel format
- `tokenizer.pkl` - Tokenizer

## Example Files to Add:

```
models/
├── cyberbullying_model.pkl       # Your main model
├── tfidf_vectorizer.pkl          # Your vectorizer (for sklearn)
├── sentiment_model.pkl           # Optional: Sentiment classifier
├── sarcasm_model.pkl             # Optional: Sarcasm detector
└── README.md                     # This file
```

## File Size Guidelines:

- Scikit-learn models: Usually < 100 MB
- DistilBERT: ~250 MB
- BERT-base: ~440 MB
- RoBERTa: ~500 MB

## Important Notes:

1. **Do not commit large model files to Git**
   - Add `*.pkl`, `*.bin`, `*.h5` to `.gitignore`
   - Use Git LFS for files > 100MB
   - Consider cloud storage for very large models

2. **File Permissions**
   - Ensure model files have read permissions
   - On Linux/Mac: `chmod 644 *.pkl`

3. **File Paths**
   - Update paths in `backend/utils/classifier.py` to match your filenames
   - Use relative paths from the utils directory

4. **Security**
   - Never commit models containing sensitive training data
   - Use encryption for proprietary models

## Getting Started:

1. Copy your model files to this directory
2. Update `backend/utils/classifier.py` with the correct file paths
3. Install required dependencies
4. Run `python backend/test_model.py` to verify

See **CUSTOM_MODEL_INTEGRATION_GUIDE.md** for detailed instructions!

---

**Current Status:** 📁 Empty - Waiting for your model files

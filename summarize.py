import sys
from transformers import pipeline

# Load the BART summarization model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def load_transcript(file_path):
    """Load the transcript from a text file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def chunk_text(text, max_chunk_size=800):
    """Split long text into smaller chunks."""
    sentences = text.split('. ')
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) < max_chunk_size:
            current_chunk += sentence + ". "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + ". "

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def summarize_large_text(text):
    """Summarize large text by chunking and recursively summarizing results."""
    chunks = chunk_text(text)
    summaries = [summarizer(chunk, max_length=200, min_length=80, do_sample=False)[0]['summary_text'] for chunk in chunks]

    # If multiple summaries exist, summarize them again
    if len(summaries) > 1:
        combined_summary = " ".join(summaries)
        final_summary = summarizer(combined_summary, max_length=250, min_length=100, do_sample=False)[0]['summary_text']
        return final_summary
    else:
        return summaries[0]

def main(file_path):
    transcript = load_transcript(file_path)
    if not transcript.strip():
        print("Transcript file is empty.")
        return
    
    print("Generating meeting minutes...")
    minutes = summarize_large_text(transcript)
    print("\n--- Meeting Minutes ---\n")
    print(minutes)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python summarize.py transcript.txt")
        sys.exit(1)
    main(sys.argv[1])

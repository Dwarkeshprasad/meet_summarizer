import sys
from transformers import pipeline

def load_transcript(file_path):
    """Load the transcript from a text file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def generate_meeting_minutes(transcript_text):
    """
    Generate meeting minutes using a summarization pipeline.
    The prompt instructs the model to convert the transcript into concise meeting minutes.
    """
    # Initialize the summarizer (using facebook/bart-large-cnn)
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    
    # Construct a prompt to generate meeting minutes
    prompt = (
        "Convert the following transcript into concise meeting minutes. "
        "Include key discussion points, decisions made, and next steps in bullet point format:\n\n"
        f"{transcript_text}"
    )
    
    # Generate summary
    summary = summarizer(prompt, max_length=200, min_length=100, do_sample=False)
    return summary[0]['summary_text']

def main(file_path):
    transcript = load_transcript(file_path)
    if not transcript.strip():
        print("Transcript file is empty.")
        return
    
    minutes = generate_meeting_minutes(transcript)
    print("--- Meeting Minutes ---\n")
    print(minutes)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python meeting_minutes.py transcript.txt")
        sys.exit(1)
    main(sys.argv[1])

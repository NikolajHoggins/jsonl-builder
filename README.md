# JSONL Builder

A web application for building JSONL files for AI conversation training data.

## Features

- Create multiple conversation examples in JSONL format
- Add multiple messages to each example
- Set message roles (user, assistant, developer)
- Copy JSONL output to clipboard
- Download JSONL file
- Real-time JSONL preview

## Output Format

The application generates valid JSONL (JSON Lines) format, where each line is a valid JSON object:

```
{"messages": [{"role": "user", "content": "user content"}, {"role": "assistant", "content": "system response"}]}
{"messages": [{"role": "user", "content": "user content"}, {"role": "assistant", "content": "system response"}]}
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Add a new example**: Click the "Add New Example" button to create a new conversation example
2. **Add messages**: Within each example, click "Add Message" to add more messages to the conversation
3. **Set message role**: Use the dropdown to select the role for each message (user, assistant, or developer)
4. **Enter content**: Type the message content in the textarea
5. **View JSONL**: See the real-time JSONL output at the bottom of the page
6. **Copy or download**: Use the Copy or Download buttons to export your JSONL data

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## License

This project is licensed under the MIT License - see the LICENSE file for details.

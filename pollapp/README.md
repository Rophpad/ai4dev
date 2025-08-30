# PollApp - Next.js Polling Application

A modern, feature-rich polling application built with Next.js 15, TypeScript, and Shadcn/UI components.

## 🚀 Features

- **Easy Poll Creation**: Intuitive interface for creating polls with multiple options
- **Real-time Results**: Live updates as votes come in
- **Authentication System**: User registration and login functionality
- **Multiple Vote Types**: Support for single choice and multiple choice polls
- **Anonymous Voting**: Option for anonymous or public voting
- **Poll Management**: Dashboard for managing created polls
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Shadcn/UI components and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **State Management**: React Hooks (Custom hooks for polls and auth)

## 📁 Project Structure

```
pollapp/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── polls/
│   │   │   ├── create/        # Poll creation page
│   │   │   ├── [id]/          # Individual poll page
│   │   │   └── page.tsx       # Polls listing page
│   │   ├── dashboard/         # User dashboard
│   │   ├── layout.tsx         # Root layout with navigation
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── layout/            # Layout components
│   │   │   └── navbar.tsx
│   │   ├── polls/             # Poll-related components
│   │   │   ├── poll-card.tsx
│   │   │   ├── create-poll-form.tsx
│   │   │   └── poll-voting.tsx
│   │   └── ui/                # Shadcn/UI components
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-auth.ts        # Authentication hook
│   │   └── use-polls.ts       # Poll management hooks
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   └── lib/
│       └── utils.ts           # Utility functions
└── public/                    # Static assets
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pollapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Usage

### Creating Polls

1. Sign up for an account or log in
2. Navigate to "Create Poll" from the navigation or dashboard
3. Fill in your poll details:
   - Title and description
   - Poll options (minimum 2, maximum 10)
   - Optional settings (expiry date, multiple votes, anonymous)
4. Publish your poll or save as draft

### Voting on Polls

1. Browse available polls on the main polls page
2. Click on a poll to view details
3. Select your choice(s) and submit your vote
4. View real-time results after voting

### Managing Your Polls

1. Access your dashboard to see all your polls
2. View poll statistics and analytics
3. Edit drafts or manage active polls
4. Share poll links with your audience

## 🎨 UI Components

The app uses Shadcn/UI components for a consistent, modern interface:

- **Forms**: Input, Label, Button, Checkbox, Radio Groups
- **Layout**: Card, Tabs, Navigation
- **Feedback**: Alert, Badge, Progress
- **Data Display**: Tables, Charts (planned)

## 🔧 Customization

### Adding New Poll Types

1. Update the `Poll` type in `src/types/index.ts`
2. Modify the `CreatePollForm` component
3. Update the `PollVoting` component to handle the new type

### Styling

The app uses Tailwind CSS with a custom design system. Colors and themes can be customized in:
- `src/app/globals.css` - CSS variables
- `tailwind.config.js` - Tailwind configuration

## 🚧 Development Status

This is a scaffolded project with placeholder functionality. The following features need implementation:

### Backend Integration
- [ ] API endpoints for authentication
- [ ] Poll CRUD operations
- [ ] Vote recording and validation
- [ ] Real-time updates (WebSocket/SSE)
- [ ] Database integration

### Authentication
- [ ] JWT token management
- [ ] Password hashing and validation
- [ ] Session management
- [ ] OAuth integration (optional)

### Features to Implement
- [ ] Poll analytics and insights
- [ ] User profiles and settings
- [ ] Poll sharing and embedding
- [ ] Comment system
- [ ] Poll templates
- [ ] Export functionality

### Testing
- [ ] Unit tests for components
- [ ] Integration tests for hooks
- [ ] E2E tests for user flows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the icon library

---

Built with ❤️ using Next.js and TypeScript
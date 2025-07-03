<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->

# 📘 Pohloh – Learning Platform for School Crafts

Pohloh is a web-based learning platform designed to help users create, manage, and engage with AI-enhanced learning content. It features role-based access, knowledge cards, learning paths, and AI tutor sessions.

---

## 👥 User Roles

### 🛡️ Admin (Organization Owner)

- Creates and manages the organization
- Full access to all users, teams, and data
- Can create knowledge cards and learning paths
- Can participate in AI tutor sessions

### 👤 Sub-Admin (Team Lead)

- Manages only their assigned team
- Can create knowledge cards and learning paths
- Can participate in AI tutor sessions
- Cannot view data from other teams

### 🙋 User (Learner)

- Can create personal knowledge cards
- Can build and enroll in learning paths
- Participates in AI tutor sessions
- Can only access their own data

---

## 📚 Core Features

### 🧠 Knowledge Cards

- Short, reusable pieces of content created by users
- Used to build custom learning paths

### 🛤️ Learning Paths

- Created by selecting multiple knowledge cards
- Provides a structured path for focused learning
- AI generates questions based on cards content


### 🤖 AI Tutor Sessions

- Users answer questions and receive feedback
- AI provides a session summary and score

---

## 🧰 Tech Stack

| Tech         | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| **Clerk**    | Authentication and role-based access (Admin, Sub-Admin, User) |
| **Supabase** | PostgreSQL database, API backend, real-time updates           |
| **OpenAI**   | AI-powered question generation and answer evaluation          |
| **Stripe**   | Subscription billing and plan management                      |
| **Vercel**   | Frontend hosting (Next.js app)                                |
| **AWS**      | Backend services and server-side logic (e.g., Lambda, EC2)    |

---

## 🚀 How It Works

1. **Admin** creates an organization and adds Sub-Admins or Users.
2. **Sub-Admins** manage their teams and learning content.
3. **Users**, **Sub-Admins**, and **Admins**:
   - Create knowledge cards
   - Build learning paths
   - Enroll and participate in AI tutor sessions
   - Receive feedback and scores

---

## 📦 Deployment

- **Frontend:** Deployed on [Vercel](https://vercel.com)
- **Backend:** Deployed via [AWS](https://aws.amazon.com)
- **Database:** Powered by [Supabase](https://supabase.com)
- **Authentication:** Handled by [Clerk](https://clerk.dev)
- **AI Integration:** Using [OpenAI](https://openai.com)
- **Payments:** Managed by [Stripe](https://stripe.com)

---


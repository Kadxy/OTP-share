# OTP Share

<div align="center">

<img src="/public/icon.svg" alt="OTP Share Logo" width="80" height="80" />

**Client-Side Generation · Zero Secret Exposure · Ephemeral Sharing**

Generate 2FA tokens in your browser and share them via secure, one-time links without ever revealing your secret key to the server.

[Report Bug](https://github.com/Kadxy/OTP-share/issues) · [Request Feature](https://github.com/Kadxy/OTP-share/issues)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKadxy%2FOTP-share&env=PRISMA_DATABASE_URL)

</div>

## ✨ Features

- 🔒 **Zero Secret Exposure**: Your TOTP secret key is used to calculate codes locally in your browser. The secret key is **never** sent to the server.
- ⏱️ **Ephemeral Access**: Links can be set to expire after a specific time (1h, 12h, 24h).
- 🔥 **Burn After Reading**: Optional "Single View" mode ensures the link is destroyed immediately after being accessed once.
- 📱 **Responsive Design**: Optimized for mobile and desktop, perfect for sharing 2FA access with colleagues or family members.
- 🛡️ **Privacy Focused**: No user accounts required. No tracking.


## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: PostgreSQL (via Prisma ORM & Prisma Accelerate)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: Vercel

## Screenshots

![Screenshot1](/screenshot/image-1.png)
![Screenshot2](/screenshot/image-2.png)
![Screenshot3](/screenshot/image-3.png)
![Screenshot4](/screenshot/image-4.png)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A PostgreSQL database (e.g., Vercel Postgres, Neon, or local)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kadxy/OTP-share.git
   cd OTP-share
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Rename `.env.example` to `.env` and add your database connection string. 
   Since this project uses Prisma Accelerate, you need an Accelerate URL (You can get it from [Vercel](https://vercel.com/)).

   ```env
   PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."
   ```

4. **Generate Prisma Client & Push Schema to Accelerate**
   ```bash
   npx prisma generate && npx prisma push
   ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📖 How It Works

1. **Input Secret**: User enters their TOTP Secret Key in the browser.
2. **Local Calculation**: The browser calculates all future TOTP codes for the selected validity period (e.g., next 1 hour).
3. **Secure Storage**: Only the **generated codes** (not the secret key) are sent to the server and stored in the database.
4. **Link Generation**: A unique, random 7-character ID is generated.
5. **Access**: The recipient opens the link and sees the valid code for the current time window.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
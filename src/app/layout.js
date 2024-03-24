import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ven a mi fiesta!",
  description: "Invitación a mi fiesta",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&family=Marck+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} style={{ margin: "0", padding: "0" }}>
        {children}
      </body>
    </html>
  );
}

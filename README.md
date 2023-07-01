This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## 此项目的起因：
已经好久没有碰前端的知识，可以说自己的前端知识还停留在vue2.0的时代。 本来就一直对React/TypeScript/TailwindCSS比较敢兴趣，
没想到又看到Next.js，Serverless，就更敢兴趣了。
在网上闲逛偶看到Meathill老师的[Nuxt3+Vercel+Serverless 全栈开发](https://www.youtube.com/playlist?list=PLSghi1XpPiOILcjjRn9HqvUV1UM79KY8C)课程，
于是就想着自己也来试试看，基于React的Next.js+Serverless来复刻一个一样的功能。

## 此项目所用到的语言、库、框架、环境：
- React
- TypeScript
- TailwindCSS
- DaisyUI
- Framer Motion
- Next.js
- Upstash（还使用了限流功能）
- Vercel

## 本地运行此项目：
- 你需要自己添加一个.env文件，可以通过.env.example来创建一个.env文件，然后在里面添加以下内容：
```
REDIS_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

如果需要运行此项目，需要在Vercel上部署，需要在Vercel上设置以下环境变量：
REDIS_URL、UPSTASH_REDIS_REST_URL、UPSTASH_REDIS_REST_TOKEN=


The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.



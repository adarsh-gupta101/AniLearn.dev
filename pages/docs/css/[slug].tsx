// Packages
import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import rehypeHighlight from "rehype-highlight";
import rehypeCodeTitles from "rehype-code-titles";

// Components + filePath/fileNames
import { cssPathFiles, cssFileNames } from "@/utils/mdxFiles";
import Container from "@/layouts/Container";
import {
  Head,
  Navbar,
  NavbarSmall,
  MDXComponents,
} from "@/components/blog-styles";

// Icons
import { AiFillEdit } from "react-icons/ai";
import { HiArrowNarrowRight } from "react-icons/hi";

// Types
import { SlugProps } from "@/types/Blogs";

export default function Slug({ data, mdxSource }: SlugProps) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const { slug }: any = router.query;

  const sortingArray = data.sort((a, b) => {
    return a.frontmatter.order - b.frontmatter.order;
  });

  const findingData = data.find((d) => {
    return d.slug.toLowerCase().includes(slug);
  });

  return (
    <>
      <Head title={findingData!.frontmatter.title} content={findingData!} />
      <NavbarSmall
        setIsOpen={setIsOpen}
        technology="CSS"
        title={findingData!.frontmatter.title}
      />

      <Container className="flex items-start gap-8 px-4 mt-24 md:px-8">
        <Navbar
          links={sortingArray}
          slug={slug}
          technology="CSS"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />

        <div
          className="w-full p-4 pb-24 mt-12 bg-white shadow-xl rounded-2xl md:mt-0"
          id="content"
        >
          <div className="items-center hidden gap-2 mb-8 md:flex">
            <Link
              href={"/docs"}
              className="px-3 py-1 text-sm rounded-full bg-opacity-20 bg-primary"
            >
              Home
            </Link>
            <HiArrowNarrowRight />
            <Link
              href={"/docs/css"}
              className="px-3 py-1 text-sm rounded-full bg-opacity-20 bg-slate-300"
            >
              CSS
            </Link>
            <HiArrowNarrowRight />
            <button className="px-3 py-1 text-sm rounded-full bg-opacity-20 bg-slate-300">
              {findingData!.frontmatter.title}
            </button>
          </div>
          <MDXRemote {...mdxSource} components={MDXComponents}></MDXRemote>
          <Link
            href={`https://github.com/AliReza1083/AniLearn.dev/tree/main/blog/css/${slug}.mdx`}
            className="flex items-center gap-2 mt-8 text-lg opacity-75 hover:opacity-100"
          >
            Edit the page <AiFillEdit />
          </Link>
        </div>
      </Container>
    </>
  );
}

export const getStaticProps = async ({ params }: any) => {
  const posts = cssFileNames.map((slug: any) => {
    const content = fs.readFileSync(path.join(cssPathFiles, slug));
    const { data } = matter(content);
    return {
      frontmatter: data,
      slug,
    };
  });

  const { slug } = params;
  const filePath = path.join(cssPathFiles, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(fileContent);
  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [rehypeCodeTitles, rehypeHighlight],
    },
  });

  return {
    props: {
      data: posts,
      mdxSource,
      frontmatter: JSON.parse(JSON.stringify(frontmatter)),
      slug,
    },
  };
};

export async function getStaticPaths() {
  const postsPath = cssFileNames.map((slug: any) => {
    return {
      params: {
        slug: slug.replace(/\.mdx?$/, ""),
      },
    };
  });
  return {
    paths: postsPath,
    fallback: false,
  };
}

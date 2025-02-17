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

// Components + filePath/fileNames
import { jsPathFiles, jsFileNames } from "@/utils/mdxFiles";
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
        technology="JS"
        title={findingData!.frontmatter.title}
      />

      <Container className="flex items-start gap-8 px-4 mt-24 md:px-8">
        <Navbar
          links={sortingArray}
          slug={slug}
          technology="JS"
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
              href={"/docs/js"}
              className="px-3 py-1 text-sm rounded-full bg-opacity-20 bg-slate-300"
            >
              JS
            </Link>
            <HiArrowNarrowRight />
            <button className="px-3 py-1 text-sm rounded-full bg-opacity-20 bg-slate-300">
              {findingData!.frontmatter.title}
            </button>
          </div>
          <MDXRemote {...mdxSource} components={MDXComponents}></MDXRemote>
          <Link
            href={`https://github.com/AliReza1083/AniLearn.dev/tree/main/blog/js/${slug}.mdx`}
            target={"_blank"}
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
  const posts = jsFileNames.map((slug: any) => {
    const content = fs.readFileSync(path.join(jsPathFiles, slug));
    const { data } = matter(content);
    return {
      frontmatter: data,
      slug,
    };
  });

  const { slug } = params;
  const filePath = path.join(jsPathFiles, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(fileContent);
  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [rehypeHighlight],
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
  const postsPath = jsFileNames.map((slug: any) => {
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

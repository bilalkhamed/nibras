import { createArticle } from '@/features/articles/service';
import { getArticles } from '@/features/articles/service/queries';
import { ArticleData } from '@/features/articles/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const articles = await getArticles({
    category: 'undefined',
    isPublished: undefined,
  });

  if (!articles.success) {
    return NextResponse.json(
      { success: false, error: articles.error.type },
      { status: articles.error.statusCode },
    );
  }

  return NextResponse.json({ success: true, data: articles.data });
}

export async function POST(request: NextRequest) {
  const articleDummyData: Omit<ArticleData, 'authorId'> = {
    title: 'Sample Article Title',
    slug: 'sample-article-title',
    content: 'This is the content of the sample article.',
    isPublished: true,
    category: 'GENERAL',
  };

  const articleRes = await createArticle(articleDummyData);

  if (!articleRes.success) {
    return NextResponse.json(
      { success: false, error: articleRes.error.type },
      { status: articleRes.error.statusCode },
    );
  }

  return NextResponse.json({ success: true, data: articleRes.data });
}

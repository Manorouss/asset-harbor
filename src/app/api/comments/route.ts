import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET /api/comments?assetId=...
// Returns all comments for a given assetId
export async function GET(request: NextRequest) {
    const assetId = request.nextUrl.searchParams.get('assetId');
    const username = request.nextUrl.searchParams.get('username');
    if (!assetId) {
        return NextResponse.json({ error: 'Missing assetId parameter' }, { status: 400 });
    }

    try {
        const comments = await prisma.comment.findMany({
            where: {
                assetId,
                ...(username ? { user: { username } } : {})
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        return NextResponse.json(comments);
    } catch (error) {
        console.error('Failed to retrieve comments:', error);
        return NextResponse.json({ error: 'Failed to retrieve comments' }, { status: 500 });
    }
}

// POST /api/comments
// Body: { assetId: string, userId: number, content: string }
// Creates a new comment
export async function POST(request: NextRequest) {
    try {
        const { content, assetId, userId } = await request.json();

        if (!content || !assetId || !userId) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const newComment = await prisma.comment.create({
            data: {
                content,
                assetId,
                userId,
            },
            include: {
                user: true,
                reactions: true,
            },
        });

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error('Failed to create comment:', error);
        return NextResponse.json({ message: 'Failed to create comment' }, { status: 500 });
    }
}

// PUT /api/comments
// Body: { commentId: number, content: string }
// Updates an existing comment
export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { commentId, content } = body;
    if (!commentId || !content) {
        return NextResponse.json({ error: 'Missing commentId or content' }, { status: 400 });
    }

    const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: { user: { select: { id: true, username: true } } },
    });

    return NextResponse.json({ comment: updatedComment });
}

// DELETE /api/comments
// Body: { commentId: number }
// Deletes a comment
export async function DELETE(request: NextRequest) {
    const body = await request.json();
    const { commentId } = body;
    if (!commentId) {
        return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
    }

    await prisma.comment.delete({
        where: { id: commentId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
}

export async function PATCH(request: Request) {
    try {
        const { commentId, content, userId } = await request.json();

        if (!commentId || !content || !userId) {
            return NextResponse.json({ message: 'Missing commentId, content, or userId' }, { status: 400 });
        }

        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!existingComment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        if (existingComment.userId !== userId) {
            return NextResponse.json({ message: 'User not authorized to edit this comment' }, { status: 403 });
        }

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { content },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error('Failed to update comment:', error);
        return NextResponse.json({ message: 'Failed to update comment' }, { status: 500 });
    }
} 
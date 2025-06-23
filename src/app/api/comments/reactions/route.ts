import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// POST /api/comments/reactions
// Body: { commentId: number, userId: number, emoji: string }
// Creates a new reaction or removes an existing one (toggle)
export async function POST(request: NextRequest) {
    try {
        const { commentId, userId, emoji } = await request.json();

        if (!commentId || !userId || !emoji) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        const existingReaction = await prisma.commentReaction.findFirst({
            where: {
                userId,
                commentId,
            },
        });

        if (existingReaction) {
            if (existingReaction.emoji === emoji) {
                // User clicked the same emoji again, so remove it
                await prisma.commentReaction.delete({ where: { id: existingReaction.id } });
            } else {
                // User changed their reaction emoji
                await prisma.commentReaction.update({
                    where: { id: existingReaction.id },
                    data: { emoji },
                });
            }
        } else {
            // No existing reaction from this user, so create a new one
            await prisma.commentReaction.create({
                data: { commentId, userId, emoji },
            });
        }

        // After any modification, fetch the updated comment with all relations
        const updatedComment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                user: true,
                reactions: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!updatedComment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        return NextResponse.json(updatedComment, { status: 201 });

    } catch (error) {
        console.error('Failed to toggle reaction:', error);
        return NextResponse.json({ message: 'Failed to toggle reaction' }, { status: 500 });
    }
} 
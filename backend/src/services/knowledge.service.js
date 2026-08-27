/**
 * src/services/knowledge.service.js — Knowledge Hub Business Logic
 */

const prisma = require('../config/database');

/**
 * Get all knowledge resources with category, competency, and search filters
 */
async function getAllResources(query = {}) {
  const { category, competencyId, search } = query;

  const where = {
    ...(category && { category }),
    ...(competencyId && { competencyId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ],
    }),
  };

  return await prisma.knowledgeResource.findMany({
    where,
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
      competency: {
        select: { id: true, name: true, category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get single knowledge resource and increment view count
 */
async function getResourceById(id) {
  const resource = await prisma.knowledgeResource.update({
    where: { id },
    data: {
      downloadsCount: { increment: 1 },
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true, jobTitle: true },
      },
      competency: true,
    },
  });

  if (!resource) {
    const err = new Error('Knowledge resource not found.');
    err.statusCode = 404;
    throw err;
  }

  return resource;
}

/**
 * Create a new knowledge resource (Admin / Trainer)
 */
async function createResource(data, authorId) {
  const {
    title,
    description,
    category,
    fileUrl,
    fileType = 'PDF',
    fileSizeKb,
    competencyId,
    tags = [],
  } = data;

  return await prisma.knowledgeResource.create({
    data: {
      title,
      description,
      category,
      fileUrl: fileUrl || '/uploads/sample-guide.pdf',
      fileType,
      fileSizeKb: fileSizeKb ? parseInt(fileSizeKb, 10) : null,
      competencyId: competencyId || null,
      tags: Array.isArray(tags) ? tags : [],
      authorId,
    },
    include: {
      competency: true,
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

/**
 * Update knowledge resource
 */
async function updateResource(id, data) {
  const {
    title,
    description,
    category,
    fileUrl,
    fileType,
    competencyId,
    tags,
  } = data;

  return await prisma.knowledgeResource.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(fileUrl && { fileUrl }),
      ...(fileType && { fileType }),
      ...(competencyId !== undefined && { competencyId: competencyId || null }),
      ...(tags && { tags: Array.isArray(tags) ? tags : [] }),
    },
    include: {
      competency: true,
    },
  });
}

/**
 * Delete knowledge resource
 */
async function deleteResource(id) {
  return await prisma.knowledgeResource.delete({ where: { id } });
}

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
};

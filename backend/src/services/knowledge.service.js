/**
 * src/services/knowledge.service.js — Knowledge Hub Business Logic
 */

const prisma = require('../config/database');

/**
 * Format resource response to preserve frontend contract compatibility:
 * - Maps `uploader` to `author` (for any components expecting author)
 * - Maps `downloadCount` to `downloadsCount`
 * - Provides default `fileType` and safe `competency: null`
 */
function mapResourceResponse(resource) {
  if (!resource) return null;
  return {
    ...resource,
    author: resource.uploader || null,
    downloadsCount: resource.downloadCount ?? 0,
    fileType: resource.mimeType || 'PDF',
    competency: null,
  };
}

/**
 * Get all knowledge resources with category and search filters
 */
async function getAllResources(query = {}) {
  const { category, search } = query;

  const where = {
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ],
    }),
  };

  const resources = await prisma.knowledgeResource.findMany({
    where,
    include: {
      uploader: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return resources.map(mapResourceResponse);
}

/**
 * Get single knowledge resource and increment download count
 */
async function getResourceById(id) {
  const resource = await prisma.knowledgeResource.update({
    where: { id },
    data: {
      downloadCount: { increment: 1 },
    },
    include: {
      uploader: {
        select: { id: true, firstName: true, lastName: true, email: true, jobTitle: true },
      },
    },
  });

  if (!resource) {
    const err = new Error('Knowledge resource not found.');
    err.statusCode = 404;
    throw err;
  }

  return mapResourceResponse(resource);
}

/**
 * Create a new knowledge resource (Admin / Trainer)
 */
async function createResource(data, userId) {
  const {
    title,
    description,
    category,
    fileUrl,
    fileName,
    fileType = 'PDF',
    fileSizeKb,
    tags = [],
    isPublic = true,
  } = data;

  const resource = await prisma.knowledgeResource.create({
    data: {
      title,
      description: description || null,
      category,
      fileUrl: fileUrl || '/uploads/sample-guide.pdf',
      fileName: fileName || null,
      fileSize: fileSizeKb ? parseInt(fileSizeKb, 10) * 1024 : null,
      mimeType: fileType || 'application/pdf',
      isPublic: isPublic !== false,
      tags: Array.isArray(tags) ? tags : [],
      uploadedBy: userId,
    },
    include: {
      uploader: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
  });

  return mapResourceResponse(resource);
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
    fileName,
    fileType,
    tags,
    isPublic,
  } = data;

  const resource = await prisma.knowledgeResource.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(fileUrl && { fileUrl }),
      ...(fileName && { fileName }),
      ...(fileType && { mimeType: fileType }),
      ...(tags && { tags: Array.isArray(tags) ? tags : [] }),
      ...(isPublic !== undefined && { isPublic }),
    },
    include: {
      uploader: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
  });

  return mapResourceResponse(resource);
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


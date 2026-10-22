/**
 * Dual-Mode PostgreSQL / Prisma Storage Adapter (`bricks/user-profile/adapters/templates/postgres-prisma.adapter.ts`)
 *
 * Implements `UserProfileStoragePort`.
 * Supports both:
 * 1. Normalized `prisma.oAuthAccount` + `prisma.user` tables (greenfield `--with-schema` repos).
 * 2. Embedded JSONB `prisma.user.profile` (`googleSub`, `appleSub`, `facebookSub`, `microsoftSub`) for instant drop-in compatibility.
 */

export function createPrismaUserProfileStorageAdapter(prismaClient) {
  if (!prismaClient || !prismaClient.user) {
    throw new Error('A valid PrismaClient instance with a `user` model is required.');
  }

  return {
    async findUserById(userId) {
      return prismaClient.user.findUnique({ where: { id: userId } });
    },

    async findUserByEmail(email) {
      if (!email) return null;
      return prismaClient.user.findUnique({
        where: { email: String(email).trim().toLowerCase() },
      });
    },

    async findUserByProviderSubject(provider, subjectId) {
      if (!provider || !subjectId) return null;

      // 1. If normalized oauthAccount table exists on Prisma client, query it first
      if (prismaClient.oAuthAccount) {
        try {
          const linked = await prismaClient.oAuthAccount.findUnique({
            where: {
              provider_providerAccountId: {
                provider,
                providerAccountId: String(subjectId),
              },
            },
            include: { user: true },
          });
          if (linked?.user) return linked.user;
        } catch {}
      }

      // 2. Fallback to JSONB path query on `user.profile.<provider>Sub`
      try {
        return await prismaClient.user.findFirst({
          where: {
            profile: {
              path: [`${provider}Sub`],
              equals: String(subjectId),
            },
          },
        });
      } catch {
        return null;
      }
    },

    async createUser({ email, passwordHash = null, role = 'user', profile = {} }) {
      return prismaClient.user.create({
        data: {
          email: String(email).trim().toLowerCase(),
          ...(passwordHash ? { passwordHash } : {}),
          role,
          profile,
        },
      });
    },

    async updateUser(userId, patch = {}) {
      const data = {};
      if (patch.email !== undefined) data.email = String(patch.email).trim().toLowerCase();
      if (patch.passwordHash !== undefined) data.passwordHash = patch.passwordHash;
      if (patch.profile !== undefined) data.profile = patch.profile;

      return prismaClient.user.update({
        where: { id: userId },
        data,
      });
    },

    async deleteUser(userId) {
      await prismaClient.user.delete({ where: { id: userId } });
    },
  };
}

export type UserRole = 'admin' | 'student';
export type PlanLevel = 'Basique' | 'Premium' | 'VIP';

export const COMPLETED_PLAN_HIERARCHY: Record<PlanLevel, number> = {
    'Basique': 1,
    'Premium': 2,
    'VIP': 3,
};

/**
 * Checks if a user has access to a specific course content.
 * 
 * Logic:
 * - Admin: ALWAYS has access.
 * - No more free lessons: if no required plan, deny access.
 * - Otherwise: User Plan Level must be >= Course Required Plan Level.
 * 
 * @param userRole - Role of the user (admin, instructor, student)
 * @param userPlan - The user's subscription plan
 * @param coursePlan - The required subscription for the course
 * @param isPreview - Whether the lesson is marked as a preview
 * @returns boolean - True if access is granted, False if locked
 */
export const checkAccess = (
    userRole: string | undefined | null,
    userPlan: string | undefined | null,
    coursePlan: string | undefined | null,
    isPreview: boolean = false
): boolean => {
    // 1. Admins always have access
    if (userRole === 'admin') {
        return true;
    }

    // 2. No free content: if no required plan provided, deny access by default
    if (!coursePlan) {
        return false;
    }

    // 3. If no user plan, access denied
    if (!userPlan) return false;

    // 4. Compare Plan Hierarchy
    const userLevel = COMPLETED_PLAN_HIERARCHY[userPlan as PlanLevel] ?? 0;
    const courseLevel = COMPLETED_PLAN_HIERARCHY[coursePlan as PlanLevel] ?? 0;

    return userLevel >= courseLevel;
};

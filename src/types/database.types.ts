export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole = 'student' | 'admin' | 'instructor';
export type TestType = 'reading' | 'listening' | 'writing' | 'speaking';
export type QuestionType = 'mcq' | 'writing' | 'speaking';
export type ResourceType = 'audio' | 'video' | 'doc' | 'article';
export type PaymentStatus = 'paid' | 'failed' | 'pending';
export type PaymentProvider = 'stripe' | 'paypal';
export type AttemptStatus = 'in_progress' | 'finished' | 'pending_review';
export type ActorType = 'user' | 'admin' | 'system';

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    role: UserRole
                    status: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    email: string
                    name?: string | null
                    role?: UserRole
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    role?: UserRole
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            plans: {
                Row: {
                    id: string
                    name: string
                    price_cents: number
                    duration_days: number
                    description: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    price_cents?: number
                    duration_days?: number
                    description?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    price_cents?: number
                    duration_days?: number
                    description?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            tests: {
                Row: {
                    id: string
                    name: string
                    test_type: TestType
                    duration_minutes: number | null
                    description: string | null
                    published: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    test_type: TestType
                    duration_minutes?: number | null
                    description?: string | null
                    published?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    test_type?: TestType
                    duration_minutes?: number | null
                    description?: string | null
                    published?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            plan_tests: {
                Row: {
                    id: string
                    plan_id: string
                    test_id: string
                    max_attempts: number | null
                    manual_correction: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    plan_id: string
                    test_id: string
                    max_attempts?: number | null
                    manual_correction?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    plan_id?: string
                    test_id?: string
                    max_attempts?: number | null
                    manual_correction?: boolean | null
                    created_at?: string | null
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    plan_id: string
                    start_at: string | null
                    end_at: string | null
                    status: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    plan_id: string
                    start_at?: string | null
                    end_at?: string | null
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    plan_id?: string
                    start_at?: string | null
                    end_at?: string | null
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            sub_test_access: {
                Row: {
                    id: string
                    subscription_id: string
                    plan_test_id: string
                    remaining_attempts: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    subscription_id: string
                    plan_test_id: string
                    remaining_attempts?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    subscription_id?: string
                    plan_test_id?: string
                    remaining_attempts?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            questions: {
                Row: {
                    id: string
                    test_id: string
                    position: number | null
                    text: string | null
                    q_type: QuestionType | null
                    points: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    test_id: string
                    position?: number | null
                    text?: string | null
                    q_type?: QuestionType | null
                    points?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    test_id?: string
                    position?: number | null
                    text?: string | null
                    q_type?: QuestionType | null
                    points?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            options: {
                Row: {
                    id: string
                    question_id: string
                    text: string | null
                    is_correct: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    question_id: string
                    text?: string | null
                    is_correct?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    question_id?: string
                    text?: string | null
                    is_correct?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            resources: {
                Row: {
                    id: string
                    test_id: string | null
                    title: string | null
                    resource_type: ResourceType | null
                    url: string | null
                    description: string | null
                    published: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    test_id?: string | null
                    title?: string | null
                    resource_type?: ResourceType | null
                    url?: string | null
                    description?: string | null
                    published?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    test_id?: string | null
                    title?: string | null
                    resource_type?: ResourceType | null
                    url?: string | null
                    description?: string | null
                    published?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            attempts: {
                Row: {
                    id: string
                    user_id: string
                    test_id: string
                    subscription_id: string | null
                    started_at: string | null
                    finished_at: string | null
                    score: number | null
                    status: AttemptStatus | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    test_id: string
                    subscription_id?: string | null
                    started_at?: string | null
                    finished_at?: string | null
                    score?: number | null
                    status?: AttemptStatus | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    test_id?: string
                    subscription_id?: string | null
                    started_at?: string | null
                    finished_at?: string | null
                    score?: number | null
                    status?: AttemptStatus | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            answers: {
                Row: {
                    id: string
                    attempt_id: string
                    question_id: string
                    option_id: string | null
                    text_answer: string | null
                    media_url: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    attempt_id: string
                    question_id: string
                    option_id?: string | null
                    text_answer?: string | null
                    media_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    attempt_id?: string
                    question_id?: string
                    option_id?: string | null
                    text_answer?: string | null
                    media_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            payments: {
                Row: {
                    id: string
                    subscription_id: string | null
                    user_id: string
                    provider: PaymentProvider | null
                    provider_payment_id: string | null
                    amount_cents: number | null
                    currency: string | null
                    status: PaymentStatus | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    subscription_id?: string | null
                    user_id: string
                    provider?: PaymentProvider | null
                    provider_payment_id?: string | null
                    amount_cents?: number | null
                    currency?: string | null
                    status?: PaymentStatus | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    subscription_id?: string | null
                    user_id?: string
                    provider?: PaymentProvider | null
                    provider_payment_id?: string | null
                    amount_cents?: number | null
                    currency?: string | null
                    status?: PaymentStatus | null
                    created_at?: string | null
                }
            }
            actions: {
                Row: {
                    id: string
                    actor_type: ActorType | null
                    actor_id: string | null
                    action_type: string | null
                    target_type: string | null
                    target_id: string | null
                    details: string | null
                    ip: string | null
                    user_agent: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    actor_type?: ActorType | null
                    actor_id?: string | null
                    action_type?: string | null
                    target_type?: string | null
                    target_id?: string | null
                    details?: string | null
                    ip?: string | null
                    user_agent?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    actor_type?: ActorType | null
                    actor_id?: string | null
                    action_type?: string | null
                    target_type?: string | null
                    target_id?: string | null
                    details?: string | null
                    ip?: string | null
                    user_agent?: string | null
                    created_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: UserRole
            test_type: TestType
            question_type: QuestionType
            resource_type: ResourceType
            payment_status: PaymentStatus
            payment_provider: PaymentProvider
            attempt_status: AttemptStatus
            actor_type: ActorType
        }
    }
}

// Legacy types for compatibility (optional, can be phased out)
export interface Plan {
    id: string;
    name: string;
    price_cents: number;
    currency: string;
    interval: 'one_time' | 'month' | 'year';
    description?: string;
    description_fr?: string;
    features: string[];
    is_popular?: boolean;
}

export type UserProfile = Database['public']['Tables']['users']['Row'];

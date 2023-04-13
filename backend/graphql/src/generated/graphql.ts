import { GraphQLResolveInfo } from "graphql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: "Query";
  records?: Maybe<Array<Maybe<TimeStreamRecord>>>;
};

export type QueryRecordsArgs = {
  binAmount: Scalars["Int"];
  timeFrame: TimeFrame;
};

export type Subscription = {
  __typename?: "Subscription";
  tickData?: Maybe<TickDataResult>;
};

export type TickDataResult = {
  __typename?: "TickDataResult";
  direction?: Maybe<Scalars["Boolean"]>;
  price?: Maybe<Scalars["Float"]>;
  ticker?: Maybe<Scalars["String"]>;
  timestamp?: Maybe<Scalars["Float"]>;
  volume?: Maybe<Scalars["Float"]>;
};

export enum TimeFrame {
  D1 = "D1",
  D2 = "D2",
  D3 = "D3",
  D4 = "D4",
  H1 = "H1",
  H2 = "H2",
  H3 = "H3",
  H4 = "H4",
  H6 = "H6",
  H8 = "H8",
  H12 = "H12",
  M1 = "M1",
  M2 = "M2",
  M3 = "M3",
  M4 = "M4",
  M5 = "M5",
  M10 = "M10",
  M15 = "M15",
  M20 = "M20",
  M30 = "M30",
  W1 = "W1",
  W2 = "W2",
  W3 = "W3",
  W4 = "W4",
}

export type TimeStreamRecord = {
  __typename?: "TimeStreamRecord";
  close: Scalars["Float"];
  high: Scalars["Float"];
  low: Scalars["Float"];
  timestamp: Scalars["Float"];
  volume?: Maybe<Scalars["Float"]>;
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  Float: ResolverTypeWrapper<Scalars["Float"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars["String"]>;
  Subscription: ResolverTypeWrapper<{}>;
  TickDataResult: ResolverTypeWrapper<TickDataResult>;
  TimeFrame: TimeFrame;
  TimeStreamRecord: ResolverTypeWrapper<TimeStreamRecord>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars["Boolean"];
  Float: Scalars["Float"];
  Int: Scalars["Int"];
  Query: {};
  String: Scalars["String"];
  Subscription: {};
  TickDataResult: TickDataResult;
  TimeStreamRecord: TimeStreamRecord;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = {
  records?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["TimeStreamRecord"]>>>,
    ParentType,
    ContextType,
    RequireFields<QueryRecordsArgs, "binAmount" | "timeFrame">
  >;
};

export type SubscriptionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Subscription"] = ResolversParentTypes["Subscription"]
> = {
  tickData?: SubscriptionResolver<
    Maybe<ResolversTypes["TickDataResult"]>,
    "tickData",
    ParentType,
    ContextType
  >;
};

export type TickDataResultResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TickDataResult"] = ResolversParentTypes["TickDataResult"]
> = {
  direction?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  price?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  ticker?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  volume?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimeStreamRecordResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["TimeStreamRecord"] = ResolversParentTypes["TimeStreamRecord"]
> = {
  close?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  high?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  low?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  volume?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TickDataResult?: TickDataResultResolvers<ContextType>;
  TimeStreamRecord?: TimeStreamRecordResolvers<ContextType>;
};

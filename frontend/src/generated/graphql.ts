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
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  timeFrameRecords?: Maybe<Array<Maybe<TimeStreamRecord>>>;
};

export type QueryTimeFrameRecordsArgs = {
  binAmount: Scalars['Int'];
  startShift?: InputMaybe<Scalars['Int']>;
  symbol: Scalars['String'];
  timeFrame: TimeFrame;
};

export type Subscription = {
  __typename?: 'Subscription';
  tickData?: Maybe<TickDataResult>;
};

export type TickDataResult = {
  __typename?: 'TickDataResult';
  direction?: Maybe<Scalars['Boolean']>;
  price?: Maybe<Scalars['Float']>;
  ticker?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Float']>;
  volume?: Maybe<Scalars['Float']>;
};

export enum TimeFrame {
  D1 = 'D1',
  H1 = 'H1',
  M1 = 'M1',
  M5 = 'M5',
  W1 = 'W1',
}

export type TimeStreamRecord = {
  __typename?: 'TimeStreamRecord';
  close: Scalars['Float'];
  high: Scalars['Float'];
  low: Scalars['Float'];
  open: Scalars['Float'];
  timestamp: Scalars['Float'];
  volume?: Maybe<Scalars['Float']>;
};

export type GetTimeFrameQueryVariables = Exact<{
  symbol: Scalars['String'];
  timeFrame: TimeFrame;
  binAmount: Scalars['Int'];
}>;

export type GetTimeFrameQuery = {
  __typename?: 'Query';
  timeFrameRecords?: Array<{
    __typename?: 'TimeStreamRecord';
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number | null;
  } | null> | null;
};

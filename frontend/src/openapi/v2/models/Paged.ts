/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DatasetOut } from './DatasetOut';
import type { EventListenerJobOut } from './EventListenerJobOut';
import type { EventListenerOut } from './EventListenerOut';
import type { FeedOut } from './FeedOut';
import type { FileOut } from './FileOut';
import type { GroupOut } from './GroupOut';
import type { MetadataDefinitionOut } from './MetadataDefinitionOut';
import type { MetadataOut } from './MetadataOut';
import type { PageMetadata } from './PageMetadata';
import type { UserOut } from './UserOut';

export type Paged = {
    metadata: PageMetadata;
    data: (Array<DatasetOut> | Array<FileOut> | Array<GroupOut> | Array<UserOut> | Array<FeedOut> | Array<EventListenerJobOut> | Array<MetadataOut> | Array<MetadataDefinitionOut> | Array<EventListenerOut>);
}

# Clowder Developer Handbook

# 1. Change Clowder Core

## 1.1 Backend

### 1.1.1 API Routes

- Backend API routes interact with the frontend.

- A controller exists for each type of object (file, dataset, users,
  etc)

- Routes take arguments from the user and dependencies and handle
  dependencies.

- Run Codegen when you add new routes/models to the backend to update
  the front end. That will add new methods to the various
  frontend/openapi/services and models.

    - npm run codegen:v2:dev

- Routes are annotated with \@get \@post \@put in FastAPI, whatever
  the type of request is being made. The response_model tells you what
  the method returns.

Here we see the method - what the arguments are. This is the
get_datasets method that populates the datasets you see in the 'Explore'
page.

```python
@router.get("", response_model=Paged)
async def get_datasets(
        user_id=Depends(get_user),
        skip: int = 0,
        limit: int = 10,
        mine: bool = False,
        admin=Depends(get_admin),
        enable_admin: bool = False,
        admin_mode: bool = Depends(get_admin_mode),
):
```

A query is created depending on these values. We see the default values
here for 'skip', 'limit' 'mine' and 'enable_admin' and 'admin_mode.'
Some are passed in as parameters, others come from dependencies like
Depends(get_user). Here we see that since 'mine' is true, we check that
the creator.email is the same as the current user_id from
Depends(get_user). Below we see the query that will be used to find the
results using the DatasetDBViewList db table.

```python
if mine:
    query.append(DatasetDBViewList.creator.email == user_id)
datasets_and_count = (
    await DatasetDBViewList.find(*query)
    .aggregate(
        [_get_page_query(skip, limit, sort_field="created", ascending=False)],
    )
    .to_list()
)

```

The results are returned as 'Paged' and as a dict for the front end. An
object would be returned as

A dictionary as well.

```python
page = Paged(
    metadata=page_metadata,
    data=[
        DatasetOut(id=item.pop("_id"), **item)
        for item in datasets_and_count[0]["data"]
    ],
)

return page.dict()
```

[Link](https://github.com/clowder-framework/clowder2/blob/bb35e0b5040443abb847e658ad61f622f189f6bb/backend/app/routers/datasets.py#L220C1-L278C23)
to full method on github.

To interact with the backend as a user directly, you can create an API
key for a user. Postman app or python requests are two options for
interacting with the back end directly instead of through the frontend
interface. When adding new methods, it can be helpful to test the
backend separately from the front end.

### 1.1.2 Models

Models folder (under
[backend/app/models/](https://github.com/clowder-framework/clowder2/tree/bb35e0b5040443abb847e658ad61f622f189f6bb/backend/app/models))
holds data models.

```python
class DatasetBaseCommon(DatasetBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    status: str = DatasetStatus.PRIVATE.name
    user_views: int = 0
    downloads: int = 0
    thumbnail_id: Optional[PydanticObjectId] = None
    origin_id: Optional[PydanticObjectId] = None
    standard_license: bool = True
    license_id: Optional[str] = None
```

If you wish to add a field in any existing model, locate the model you
wish to change and add it with corresponding types, and if needed, a
default value.

E.g. I wish to have a "favorite" field stored in each of the dataset
documents.

```python
class DatasetBaseCommon(DatasetBase):
    ...
    favorite: bool = False


```

#### 1.1.2.1 Conventions

{XXX}**DBViewList** - View Models. These models are used to create views
in MongoDB, which aggregate and transform data.

{XXX}**DB** - These models are directly tied to the Documents in MongoDB
collections.\
{XXX}**In** - These models are used for incoming data, such as defining
the request body for the API endpoint.

{XXX}**Out** - These models are used for defining the data out, such as
API responses.

#### 1.1.2.2 Use models in the Routes

E.g. Define the response model, the endpoint will automatically cast the
return object into the model shape

E.g. Define the request body shape. Dataset_in must match the shape of
the DatasetIn model otherwise it will complain.

```python
@router.post("", response_model=DatasetOut)
async def save_dataset(
        dataset_in: DatasetIn,
        license_id: str,
        user=Depends(get_current_user),
        es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    ...
    return dataset.dict()
```

## 1.2 Frontend

### 1.2.1 Components

The frontend consists of various React components, each serving specific
functions. **Before developing a new component, please review the
existing ones to see if any can be reused.**

![](devhandbookmedia/image12.png)

#### 1.2.1.1 Reuse Components

Components are often reused. Both Dataset and File use the same
DisplayMetadata component. The component takes the resourceType as an
argument, that can be a dataset or file. Reuse of components can save
time and keep design and function consistent.

```javascript
import FilesTable from "../files/FilesTable";
import {MetadataIn} from "../../openapi/v2";
import {DisplayMetadata} from "../metadata/DisplayMetadata";
import {DisplayListenerMetadata} from "../metadata/DisplayListenerMetadata";
import {EditMetadata} from "../metadata/EditMetadata";
```

Here we see the import of DisplayMetadata. This component is used for
Files or Datasets. Below we see arguments for resourceId and
resourceType, which can be file or dataset.

```javascript
export const DisplayMetadata = (props: MetadataType) => {
	const {
		updateMetadata,
		deleteMetadata,
		resourceType,
		resourceId,
		publicView,
	} = props;
```

#### 1.2.1.2 Styled Components

We provide a set of basic Clowder-styled components (e.g., Button,
Select, Title, Footnote). These can be used just like MUI components,
with styling controlled here and props still passable. Found those
components
[here](https://github.com/clowder-framework/clowder2/tree/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/components/styledComponents).

For example, the ClowderSelect component:

```javascript
import {ClowderSelect} from "../styledComponents/ClowderSelect";

...
<FormControl>
	<ClowderSelect
		value={String(selectedVersionNum)}
		defaultValue={"viewer"}
		onChange={(event) => {
			setSelectedVersionNum(event.target.value);
			setSnackBarMessage(`Viewing version ${event.target.value}`);
			setSnackBarOpen(true);
		}}
	>
		{fileVersions.map((fileVersion) => {
			return (
				<MenuItem value={fileVersion.version_num}>
					{fileVersion.version_num}
				</MenuItem>
			);
		})}
	</ClowderSelect>


````

#### 1.2.1.3 Auth Wrapper

Some components show different things based on user permissions. Here is
an
[example](https://github.com/clowder-framework/clowder2/blob/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/components/datasets/Dataset.tsx#L456)

Using `<AuthWrapper/>`. We see that only the **owner**, **editor** or
**uploader** can have access to the "Add Metadata" component.

```javascript
<AuthWrapper
	currRole={datasetRole.role}
	allowedRoles={["owner", "editor", "uploader"]}
>
	<Box textAlign="center">
		<Button
			variant="contained"
			sx={{m: 2}}
			onClick={() => {
				setEnableAddMetadata(true);
			}}
		>
			Add Metadata
		</Button>
	</Box>
</AuthWrapper>

```

#### 1.2.1.4 Full Example

Take
[DisplayMetadata](https://github.com/clowder-framework/clowder2/blob/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/components/metadata/DisplayMetadata.tsx#L31)
as an example:

```javascript
export const DisplayMetadata = (props: MetadataType) => {
	const {
		updateMetadata,
		deleteMetadata,
		resourceType,
		resourceId,
		publicView,
	} = props;

	const dispatch = useDispatch();

	const getMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchMetadataDefinitions(name, skip, limit));

```

[Here](https://github.com/clowder-framework/clowder2/blob/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/components/metadata/DisplayMetadata.tsx#L92-L106)
we see that whether we have a dataset or file, we use different methods
to get the metadata. This is how components can be reused. There are
also options for publicView if the user is not logged in.

```javascript
useEffect(() => {
	if (resourceType === "dataset") {
		if (publicView) {
			listPublicDatasetMetadata(resourceId);
		} else {
			listDatasetMetadata(resourceId);
		}
	} else if (resourceType === "file") {
		if (publicView) {
			listPublicFileMetadata(resourceId);
		} else {
			listFileMetadata(resourceId);
		}
	}
}, [resourceType, resourceId]);

```

These work by [importing
actions](https://github.com/clowder-framework/clowder2/blob/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/components/metadata/DisplayMetadata.tsx#L5-L12)
from frontend/actions

```javascript
import {
	fetchDatasetMetadata,
	fetchFileMetadata,
	fetchMetadataDefinitions,
	fetchPublicFileMetadata,
	fetchPublicMetadataDefinitions,
} from "../../actions/metadata";
```

And we can see the call in
[frontend/src/actions/metadata.js](https://github.com/clowder-framework/clowder2/blob/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/actions/metadata.js#L7-L31)
that calls a method from the Services

```javascript
export function fetchMetadataDefinitions(name, skip, limit) {
	return (dispatch) => {
		return V2.MetadataService.getMetadataDefinitionListApiV2MetadataDefinitionGet(
			name,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_METADATA_DEFINITIONS,
					metadataDefinitionList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, fetchMetadataDefinitions(name, skip, limit))
				);
			});
	};
}

```

And looking at the service in
[/frontend/src/openapi/v2/MetadataService](https://github.com/clowder-framework/clowder2/blob/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/openapi/v2/services/MetadataService.ts#L26-L43)
.ts,
we see it calling the back end routes.

```javascript
public
static
getMetadataDefinitionListApiV2MetadataDefinitionGet(
	name ? : string,
	skip ? : number,
	limit
:
number = 2,
):
CancelablePromise < Paged > {
	return __request({
		method: 'GET',
		path: `/api/v2/metadata/definition`,
		query: {
			'name': name,
			'skip': skip,
			'limit': limit,
		},
		errors: {
			422: `Validation Error`,
		},
	});
```

### 1.2.2 Redux

![](devhandbookmedia/image10.png)

- Add an action under the action folder
  [here](https://github.com/clowder-framework/clowder2/tree/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/actions)

- Update the reducer
  [here](https://github.com/clowder-framework/clowder2/tree/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/reducers)

- Access the action and state in component use hooks.

```javascript

import {useDispatch, useSelector} from "react-redux";

...

const dispatch = useDispatch();
const listFileSummary = (fileId: string | undefined) =>
	dispatch(fetchFileSummary(fileId));

const file = useSelector((state: RootState) => state.file);

```

# 2. Write New Extractors

### 2.1 Components of extractors

<Extractor_name>

- requirements.txt contains the required set of libraries to install
  (It always need pyclowder, this is library used to connect to
  Clowder)

```
pyclowder==3.0.7
```

- extractor_info.json contains the details about the extractors

```json

{
  "@context": "http://clowder.ncsa.illinois.edu/contexts/extractors.jsonld",
  "name": "ncsa.wordcount-3",
  "version": "2.0",
  "description": "WordCount extractor. Counts the number of characters, words and lines in the text file that was uploaded.",
  "author": "Rob Kooper <kooper@illinois.edu>",
  "contributors": [],
  "contexts": [
    {
      "lines": "http://clowder.ncsa.illinois.edu/metadata/ncsa.wordcount#lines",
      "words": "http://clowder.ncsa.illinois.edu/metadata/ncsa.wordcount#words",
      "characters": "http://clowder.ncsa.illinois.edu/metadata/ncsa.wordcount#characters"
    }
  ],
  "repository": [
    {
      "repType": "git",
      "repUrl": "https://opensource.ncsa.illinois.edu/stash/scm/cats/pyclowder.git"
    }
  ],
  "process": {
    "file": [
      "text/*",
      "application/json"
    ]
  },
  "external_services": [],
  "dependencies": [],
  "bibtex": []
}
```

- .py file contains the code for your extractor

```python

class WordCount(Extractor):
    """Count the number of characters, words and lines in a text file."""

    def __init__(self):
        Extractor.__init__(self)

        # add any additional arguments to parser
        # self.parser.add_argument('--max', '-m', type=int, nargs='?', default=-1,
        #                          help='maximum number (default=-1)')

        # parse command line and load default logging configuration
        self.setup()

        # setup logging for the extractor
        logging.getLogger('pyclowder').setLevel(logging.DEBUG)
        logging.getLogger('__main__').setLevel(logging.DEBUG)

```

- README contains the basic instructions to run the extractor

- **Dockerfile contains a set of instructions to build a Docker image
  out of the extractor**

More details are [here](https://github.com/clowder-framework/pyclowder)
about creating an extractor

### 2.2 Starting the extractor

#### 2.2.1 Production mode

- Create Dockerfile and build docker container

- Add to
  [docker-compose.extractors.yml](https://github.com/clowder-framework/clowder2/blob/bb35e0b5040443abb847e658ad61f622f189f6bb/docker-compose.extractors.yml).

    - Make sure to include default environment variables
      **CLOWDER_VESERION**, and **RABBITMQ_URI**.

    - Set the networks to **clowder2**

  For example:

```yaml
sentiment-analysis:
  image: socialmediamacroscope/sentiment_analysis_extractor:latest
  environment:
    CLOWDER_VERSION: 2
    RABBITMQ_URI: amqp://guest:guest@rabbitmq:5672/%2F
  networks:
    - clowder2
  restart: unless-stopped
```

- Run `docker-compose -f docker-compose.yml -f docker-compose.extractors.yml -p clowder-prod up`

#### 2.2.2 Dev mode

Run the main file in your extractor in the IDE, with environment
parameters set. Similar to above, **CLOWDER_VERSION** and
**RABBITMQ_URI** are required.

![](devhandbookmedia/image14.png)

Alternatively, using command line

```shell
export PYTHONUNBUFFERED=1
export CLOWDER_VERSION=2
export IMAGE_BINARY=/usr/local/bin/convert
python run pyclowder/sample-extractors/image-preview-v2/binary_extractor.py
```

### 2.3 Check if extractor registered

- Log in

- Turn on admin mode

- Go to extractors tab at the side menu, you should be able to see
  your extractors with information

![](devhandbookmedia/image11.png)
![](devhandbookmedia/image13.png)

- Go to the file/dataset that are compatible with that extractor.
  Submit and watch the logs

![](devhandbookmedia/image9.png)

### 2.4 Create Custom Widget submitting to Extractor

#### 2.4.1 Modifying Widget for RSJF

In order to create custom widgets, we need to take the following steps:

- After you created your component make sure, there is an onChange
  function, this onChange function. The component will use it to set
  the parameters. In my example, I am creating an Image Annotator, so
  I need to save the name and points of the annotation

> ![](devhandbookmedia/image2.png)
>
> ![](devhandbookmedia/image4.png)

- Create a component in a directory (I use StyledComponents), this
  offers us to customize the component for the extractor but mainly
  acts as an intermediary between the rsjf form and the component. The
  form passes an object which contains a parameter and title that I
  use to create a title

> ![](devhandbookmedia/image3.png)

#### 2.4.2 Adding to the RSJF

Now the widget is ready for the form, our form for extractors is in the
file SubmitExtraction.tsx. The steps are:

Import the widget component and add to the widgets object that gives the
form a map to the different custom widgets

![](devhandbookmedia/image1.png)

In order to map the parameter to the widget, we use the second parameter
for the form uiSchema. In the extractor-info.json, we give the parameter
have a property called format that tells the form to map this widget to
the extractor.

We use a for loop in the file here to go through the parameters and add
it to the uiSchema if a parameter needs a custom widget

![](devhandbookmedia/image6.png)

#### 2.4.3 In the extractor-info.json

In the extractor json that renders the form, create the parameter that
can map to this widget. So, since in my case, I use the field
ImageAnnotator to map to this widget, I create the following

```json
"parameters": {
"schema": {
"Annotations": {
"type": "object",
"title": "Annotate image",
"description": "Annotate image",
"format": "ImageAnnotator"
}
}
}
```

When we open the extractor, we should the be able to see the widget,

![](devhandbookmedia/image5.png)

![](devhandbookmedia/image7.png)

When you submit the extractor, you can see the parameters are passed in
if you extractor script logs the parameters it receives

![](devhandbookmedia/image8.png)

# 3. Custom Visualization Component

You can refer to this PR that adds word cloud visualization as an end to
end example:
[https://github.com/clowder-framework/clowder2/pull/786](https://github.com/clowder-framework/clowder2/pull/786)

### 3.1 Create Folder

under [visualization
folder](https://github.com/clowder-framework/clowder2/tree/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/components/visualizations)

### 3.2 Create the main component

This component could expect 3 props: ***fileId, visualizationId,
publicView***

***If fileId specified → Raw file bytes (below ) is used to***

***If visualizationId specified → Visualization can be generated by
(processed) visualization data source***

***If publicView is True → Visualization can be viewed on public
dataset***

```javascript
type
VisProps = {
	fileId? : string;
	visualizationId? : string;
	publicView? : boolean | false;
};

// E.g.
export default function Image(props: VisProps) {
	const {fileId, visualizationId, publicView} = props;

```

### 3.3 Create manifest.json

- Ensure the \"main\" is directed to the component.

- Add visConfig fields, ensuring the \"name\" matches the folder name.

- List the \"mainType\" and \"mimeType\" that the visualization widget
  supports.

```json

{
  "name": "vega-spec",
  "version": "1.0.0",
  "description": "A simple visualization using vegalite and the spec in json from vis data.",
  "main": "VegaSpec.tsx",
  "dependencies": {
    "clowder2-core": "1.0.0",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "vega": "^5.20.2"
  },
  "visConfig": {
    "name": "VegaSpec",
    "mainType": "application",
    "mimeTypes": [
      "application/json"
    ],
    "fields": []
  }
}
```

### 3.4 Register the component

Add code block in
[visualization.config.ts](https://github.com/clowder-framework/clowder2/blob/bb35e0b5040443abb847e658ad61f622f189f6bb/frontend/src/visualization.config.ts).
Place the correct manifest.json

For example:

```javascript
const configWordCloudSpec = require("./components/visualizations/VegaSpec/manifest.json");

visComponentDefinitions.push({
	name: configWordCloudSpec.name,
	mainType: configWordCloudSpec.visConfig.mainType,
	mimeTypes: configWordCloudSpec.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configWordCloudSpec)),
});

```

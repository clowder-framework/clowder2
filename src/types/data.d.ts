interface StationSummary {
	name: string;
	date: string; // Date in ISO 8601 format (i.e. YYYY-MM-DD)
	coordinates: [number, number];
}

interface StationDetails extends StationSummary {
	sediment_sample: string;
	location: string;
	water_body: string;
	sea_area: string;
	place: string;
	fao_area: number;
	gear: string;
	depth_fathoms: number;
	bottom_water_temp_c: number;
	bottom_water_depth_fathoms: number;
	specific_gravity_at_bottom: number;
	surface_temp_c: number;
	specific_gravity_at_surface: number;
	water_temp_c_at_depth_fathoms: {
		[depth: string]: number;
	};
	text: string;
	species: { id: string }[];
}

interface SpeciesSummary {
	id: string;
	matched_canonical_full_name: string;
}

interface SpeciesDetails extends SpeciesSummary {
	id: string;
	matched_name: string;
	matched_canonical_simple_name: string;
	common_name: string;
	classification_path: string;
	classification_ranks: string;
	classification_ids: string;
	data_source_id: number;
}

interface Dataset {

}

interface File {
	id: string;
	filename: string;
	size: number;
	"date-created": string;
	contentType:string;
	action:string;
}

interface DataState {
	files: File[];
	datasets: Dataset[];
	stationsList: StationSummary[];
	stationsObject: { [name: string]: StationDetails };
	selectedStation: StationDetails | null;
	allSpeciesList: SpeciesSummary[];
	allSpeciesObject: { [matched_canonical_full_name: string]: SpeciesDetails };
	selectedSpecies: string[];
}

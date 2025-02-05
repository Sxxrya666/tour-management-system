class APIfeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}
	filter() {
		const queryObject = { ...this.queryString };
		console.log(queryObject)
		const queriesToExclude = ["page", "limit", "sort", "fields"];
		queriesToExclude.forEach((val) => delete queryObject[val]);
		// console.log(` \x1b[31mexcluded queries are: "${queriesToExclude}\x1b[0m"`);
		let queryStr = JSON.stringify(queryObject);
		queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
		// console.log(JSON.parse(queryStr));

		this.query = this.query.find(JSON.parse(queryStr));

		return this;
	}
	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(",").join(" ");
			console.log("sort by: ", sortBy);
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort("-createdAt");
		}

		return this;
	}

	fields() {
		if (this.queryString.fields) {
			const incomingFieldsValue = this.queryString.fields.split(",").join(" ");
			// console.log("incomingFieldsValue: ", incomingFieldsValue);
			this.query = this.query.select(incomingFieldsValue);
		} else {
			//set default behaviour
			this.query = this.query.select("-__v"); //deselecting
		}

		return this;
	}

	paginate() {
		const pageNumber = parseInt(this.queryString.page) || 1;
		const limit = parseInt(this.queryString.limit) || 100;
		const skip = (pageNumber - 1) * limit;
		if (!pageNumber || !limit) {
			throw new Error("page or limit not provided");
		} else {
			console.log("pageNumber:", pageNumber);
			console.log("skipped:", skip);
		}
		this.query = this.query.skip(skip).limit(limit);
		return this;
	}
}

module.exports = APIfeatures;

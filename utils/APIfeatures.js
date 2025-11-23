class APIfeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}
	filter() {
		const queryObject = { ...this.queryString };
		const queriesToExclude = ["page", "limit", "sort", "fields"];
		queriesToExclude.forEach((val) => delete queryObject[val]);
		let queryStr = JSON.stringify(queryObject);
		queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
		this.query = this.query.find(JSON.parse(queryStr));

		return this;
	}
	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(",").join(" ");
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort("-createdAt");
		}

		return this;
	}

	fields() {
		if (this.queryString.fields) {
			const incomingFieldsValue = this.queryString.fields.split(",").join(" ");
			this.query = this.query.select(incomingFieldsValue);
		} else {
			this.query = this.query.select("-__v");
		}

		return this;
	}

	paginate() {
		const pageNumber = parseInt(this.queryString.page) || 1;
		const limit = parseInt(this.queryString.limit) || 50;
		const skip = (pageNumber - 1) * limit;
		if (!pageNumber || !limit) {
			throw new Error("page or limit not provided");
		} else {

			this.query = this.query.skip(skip).limit(limit);
			return this;
		}
	}
}

module.exports = APIfeatures;

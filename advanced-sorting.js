var Sortable = function Sortable (array, property) {
	var sortable = this;
	sortable.array = array || [];
	sortable.property = property || '';
};

Sortable.prototype.swap = function swap (a, b) {
	var tmp = this.array[a];
	this.array[a] = this.array[b];
	this.array[b] = tmp;
};

Sortable.prototype.partition = function partition (begin, end, pivot) {
	var piv = this.array[pivot];
	this.swap(pivot, end-1);

	var store = begin;
	var ix = begin;

	while (ix < end-1) {
		switch (typeof this.array[ix][this.property]) {

		case 'string':
			if (this.array[ix][this.property].toLowerCase() <= piv[this.property].toLowerCase()) {
				this.swap(store, ix);
				++store;
			}
		break;

		default:
			if (this.array[ix][this.property] <= piv[this.property]) {
				this.swap(store, ix);
				++store;
			}
		break;

		}; // close switch

		ix++;
	};

	this.swap(end-1, store);
	return store;
};

Sortable.prototype.qsortByObjectProperty = function qsortByObjectProperty (begin, end) {
	if (end-1 > begin) {
		var pivot = begin + Math.floor(Math.random()*(end-begin));

		pivot = this.partition(begin, end, pivot);

		this.qsortByObjectProperty(begin, pivot);
		this.qsortByObjectProperty(pivot+1, end);
	}
};

Sortable.prototype.updateByMergeSort = function updateByMergeSort() {
	this.array = this.mergesortByObjectProperty(this.array);
};

Sortable.prototype.mergesortByObjectProperty = function mergesortByObjectProperty (array) {
	if (array.length < 2) { return array; };
	var middle = Math.ceil(array.length/2);
	return this.merge(this.mergesortByObjectProperty(array.slice(0,middle)), this.mergesortByObjectProperty(array.slice(middle)));
};

Sortable.prototype.merge = function merge (left, right) {
	var result = new Array();

	while ((left.length > 0) && (right.length > 0)) {
		if (this.mergeComparison(left[0],right[0]) < 0) { result[result.length] = left.shift(); }
		else { result[result.length] = right.shift(); };
	};

	while (left.length > 0) { result[result.length] = left.shift(); };
	while (right.length > 0) { result[result.length] = right.shift(); };
	return result;
};

Sortable.prototype.mergeComparison = function mergeComparison (left, right) {
	var leftprop = left[this.property];
	var rightprop = right[this.property];

	switch (typeof leftprop) {

	case 'string':
		var leftproplower = leftprop.toLowerCase();
		var rightproplower = rightprop.toLowerCase();

		if (leftproplower == rightproplower) { return 0; }
		else if (leftproplower < rightproplower) { return -1; }
		else { return 1; };
	break;

	default:
		if (leftprop == rightprop) { return 0; }
		else if (leftprop < rightprop) { return -1; }
		else { return 1; };
	break;

	}; // close switch
};

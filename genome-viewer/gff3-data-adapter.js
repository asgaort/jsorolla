GFF3DataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;

function GFF3DataAdapter(dataSource, args){
	FeatureDataAdapter.prototype.constructor.call(this, dataSource, args);
	var _this = this;
	
	this.async = true;

	//stat atributes
	this.featuresCount = 0;
	this.featuresByChromosome = {};

	if (args != null){
		if(args.async != null){
			this.async = args.async;
		}
	}
	
	if(this.async){
		this.dataSource.success.addEventListener(function(sender,data){
			_this.parse(data);
			_this.onLoad.notify();
		});
		this.dataSource.fetch(this.async);
	}else{
		var data = this.dataSource.fetch(this.async);
		this.parse(data);
	}
	
};

GFF3DataAdapter.prototype.parse = function(data){
	var _this = this;
	
	//parse attributes column
	var getAttr = function(column){
		var arr = column.split(";");
		var obj = {};
		for (var i = 0, li = arr.length; i<li ; i++){
			var item = arr[i].split("=");
			obj[item[0]] = item[1];
		}
		return obj;
	};
	
	var dataType = "data";
	var lines = data.split("\n");
//	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			var chromosome = fields[0].replace("chr", "");

			
			//NAME  SOURCE  TYPE  START  END  SCORE  STRAND  FRAME  GROUP
			var feature = {
					"chromosome": chromosome, 
					"label": fields[2], 
					"start": parseInt(fields[3]), 
					"end": parseInt(fields[4]), 
					"score": parseFloat(fields[5]),
					"strand": fields[6], 
					"frame": fields[7],
					"attributes": getAttr(fields[8]),
					"featureType":	"gff3"
			} ;

			this.featureCache.putFeatures(feature, dataType);
			if (this.featuresByChromosome[chromosome] == null){
				this.featuresByChromosome[chromosome] = 0;
			}
			this.featuresByChromosome[chromosome]++;
			this.featuresCount++;
		}
	}
};

  //get url params
  
  function getParameter(paramName) {
      var searchString = window.location.search.substring(1),
          i, val, params = searchString.split("&");
    
      for (i=0;i<params.length;i++) {
        val = params[i].split("=");
        if (val[0] == paramName) {
          return unescape(val[1]);
        }
      }
      return null;
  }

  //gets the color and description based on the score
  function score2cd (score,limits) {
    out = new Object;
    out.color = 'gray';
    out.text = ' is a great guy';
    for (i = 0; i < limits.length; i++) {
      if (score <= limits[i].upper) return limits[i];
    }
    return out;
  }

  var votings = new Object;
  
  //function calculate score
  function scoreit(mepvotes,topics ) {
    //reorder campaign data for easier access
    $.each(topics, function (i0, v0) {
      $.each(v0.votings, function (i, v) {
        votings[v.v_dbid] = v;
        votings[v.v_dbid].topicweight = v0.weight;
      });
    });
    wsum = 0;
    vsum = 0;
    $.each(mepvotes, function( index, value ) {
      if ((votings[value.v_dbid] != 'undefined') && (value.exists)) {
        wsum += votings[value.v_dbid].v_weight*votings[value.v_dbid].topicweight;
        var curval = votings[value.v_dbid].v_weight*votings[value.v_dbid].topicweight*parseInt(value.vote)*parseInt(votings[value.v_dbid].v_recommendation);
        vsum += curval;
        votings[value.v_dbid].v_score = curval;
      }
    });
    
    $.each(mepvotes, function( index, value ) {
    	if (wsum != 0) {
    		v_value =  (votings[value.v_dbid].v_score/wsum)/2 * 100;
    		if (isNaN(v_value)) votings[value.v_dbid].v_display = "---";
    		else if (v_value == 0) votings[value.v_dbid].v_display = "±0";
    		else  votings[value.v_dbid].v_display = ((v_value > 0)?"+":"") + Math.round(v_value*10)/10;
    	} 
    });
    
    if (wsum != 0)
      out = Math.round((vsum/wsum + 1)/2 * 100);
    else
      out = 50;
    return out;
  }

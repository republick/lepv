/*
 * Open source under the GPLv2 License or later.
 * Copyright (c) 2016, Mac Xu <shinyxxn@hotmail.com>.
 */

var LepvChart = function(divName = '') {
  this.chartDivName = divName;
  this.chartDiv = null;
  if (this.chartDivName != '') {
    this.chartDiv = $('#' + this.chartDivName);
  }
  
  this.charts = null;
  this.chartTitle = null;
  this.chartHeaderColor = 'grey';

  this.controlElements = {};
  this.configDialog = null;

  this.maxDataCount = 150;
  this.refreshInterval = 2; // in seconds
  
  this.isChartPaused = false;
  this.invervalId = null;
  
  this.server = null;
  
  this.requestId = null;
  this.responseId = null;
  
  this.executionConfig = 'release';
  
  this.data = {};
  this.dataUrl = null;

  this.initializeControlElements();
};

LepvChart.prototype.updateChartHeader = function() {

  var divHeadingParentPanelColorClass = 'panel-' + this.chartHeaderColor;
  
  if (this.isChartPaused) {
    this.controlElements.pauseResumeDiv.removeClass("glyphicon-pause");
    this.controlElements.pauseResumeDiv.addClass("glyphicon-play");

    this.controlElements.pauseResumeDiv.tooltip('hide').attr("data-original-title", "点击以继续刷新");

    this.controlElements.headingParentDiv.removeClass(divHeadingParentPanelColorClass);
    this.controlElements.headingParentDiv.addClass('panel-grey');
    
  } else {
    this.controlElements.pauseResumeDiv.removeClass("glyphicon-play");
    this.controlElements.pauseResumeDiv.addClass("glyphicon-pause");

    this.controlElements.pauseResumeDiv.tooltip('hide').attr("data-original-title", "点击可暂停刷新");

    this.controlElements.headingParentDiv.removeClass('panel-grey');
    this.controlElements.headingParentDiv.addClass(divHeadingParentPanelColorClass);
  }
};

LepvChart.prototype.onPauseResume = function() {
    
  // Inside an event handler, "this" is the object that created the event!!!!!
  // unless we bind event???
  if (this.controlElements == null) {
    return;
  }
  
  this.isChartPaused = !this.isChartPaused;
  
  this.updateChartHeader();
};

LepvChart.prototype.onConfig = function() {

  if (this.controlElements == null) {
    return;
  }

  if (this.configDialog == null) {
    this.configDialog = new LepvChartConfig(this.updateConfigs, this);
    this.configDialog.saveButton.on("click", $.proxy(this.updateConfigs, this));
  }

  this.configDialog.show({'refreshInterval': this.refreshInterval, 'maxDataCount': this.maxDataCount});
  
};

LepvChart.prototype.updateConfigs = function(newConfigs) {
  if (newConfigs.maxDataCount != null) {
    this.maxDataCount = newConfigs.maxDataCount;
  }
  
  if (newConfigs.refreshInterval != null) {
    var updatedRefreshInterval = newConfigs.refreshInterval;
    if (updatedRefreshInterval != this.refreshInterval) {
      this.refreshInterval = newConfigs.refreshInterval;

      //clearInterval(this.invervalId);
      //
      //this.intervalId = setInterval(function () {
      //  this.refreshChart();
      //}, this.refreshInterval * 1000);
    }
  }
};

LepvChart.prototype.initializeControlElements = function() {
  if (this.chartDiv == null) {
    return;
  }

  this.createControlElements();
  
  // bind click events
  // IMPORTANT:  $.proxy() is the way to get the event bind work here
  this.controlElements.pauseResumeLink.on("click", $.proxy(this.onPauseResume, this));

  this.controlElements.configLink.on("click", $.proxy(this.onConfig, this));
};

LepvChart.prototype.createControlElements = function() {
  if (this.chartDiv == null) {
    return;
  }

  //  // navigate to the title div
  var panelBodyDiv = this.chartDiv.parent();
  if ( ! panelBodyDiv.hasClass('panel-body')) {
    panelBodyDiv = panelBodyDiv.parent();
  }

  var divHeadingPanel = panelBodyDiv.siblings("div").first();
  if ( ! divHeadingPanel.hasClass('panel-heading')) {
    console.log("Failed to locate panel-heading div, not able to create control elements for " + this.chartDiv.getId());
    return;
  }

  // remove all the "a" children of the heading panel
  divHeadingPanel.children('a').remove();

  var divHeadingParentPanel = divHeadingPanel.parent();
  if (this.chartHeaderColor != null) {
    var divHeadingParentPanelColorClass = 'panel-' + this.chartHeaderColor;
    if (!divHeadingParentPanel.hasClass(divHeadingParentPanelColorClass)) {
      divHeadingParentPanel.addClass(divHeadingParentPanelColorClass);
    }
  }

  this.controlElements = {};

  //// config button
  var elementConfigLink = $("<a></a>");
  var elementConfigDiv = $("<div></div>")
      .attr("data-toggle", "tooltip")
      .attr("data-placement", "auto bottom")
      .attr("title", '设置');

  elementConfigDiv.addClass("pull-right glyphicon glyphicon-cog glyphicon-white");
  elementConfigLink.append(elementConfigDiv);
  divHeadingPanel.append(elementConfigLink);

  this.controlElements['configLink'] = elementConfigLink;
  this.controlElements['configDiv'] = elementConfigDiv;

  // pause/resume button
  var elementPauseResumeLink = $("<a></a>").attr("isPaused", this.isChartPaused);
  var elementPauseResumeDiv = $("<div></div>")
      .attr("data-toggle", "tooltip")
      .attr("data-placement", "auto bottom");
  elementPauseResumeDiv.addClass("pull-right glyphicon glyphicon-white");

  elementPauseResumeDiv.addClass("glyphicon-pause");
  elementPauseResumeDiv.attr("title", "点击可暂停刷新");

  elementPauseResumeLink.append(elementPauseResumeDiv);
  divHeadingPanel.append(elementPauseResumeLink);

  this.controlElements['pauseResumeLink'] = elementPauseResumeLink;
  this.controlElements['pauseResumeDiv'] = elementPauseResumeDiv;
  this.controlElements['headingParentDiv'] = divHeadingParentPanel;

};

LepvChart.prototype.refreshChart = function() {
  // TODO:
};

'use strict';
class Gauge{
    constructor(configuration)
    {
        const config={
            size:250,margin:30,minValue:0,maxValue:10,majorTicks:5,lowThreshhold:3,highThreshhold:7,lowThreshholdColor:'#009900',defaultColor:'#ffe500',highThreshholdColor:'#cc0000',transitionMs:1000,displayUnit:'Value'};
        this.config=Object.assign(config,configuration);
        this.arcPadding=15;this.arcWidth=20;
        this.labelInset=10;const pointerWidth=6;
        const pointerTailLength=5;
        const pointerHeadLength=this._radius()-this.labelInset;this.lineData=[[pointerWidth/2,0],[0,-pointerHeadLength],[-(pointerWidth/2),0],[0,pointerTailLength],[pointerWidth/2,0]];
        this.minAngle=-90,this.maxAngle=90,this.angleRange=this.maxAngle-this.minAngle;
        this.scale=d3.scaleLinear().range([0,1]).domain([config.minValue,config.maxValue]);
        const colorDomain=[config.lowThreshhold,config.highThreshhold].map(this.scale);
        const colorRange=[config.lowThreshholdColor,config.defaultColor,config.highThreshholdColor];
        this.colorScale=d3.scaleThreshold().domain(colorDomain).range(colorRange);
        this.ticks=this.scale.ticks(config.majorTicks);
        //console.log(this.ticks,config.majorTicks);
        this.threshholds=[config.minValue,config.lowThreshhold,config.highThreshhold,config.maxValue].map(d=>this.scale(d));
        this.arc=d3.arc().innerRadius(this._radius()-this.arcWidth-this.arcPadding).outerRadius(this._radius()-this.arcPadding).startAngle((d,i)=>{
            const ratio=i>0?this.threshholds[i-1]:this.threshholds[0];
            return this._deg2rad(this.minAngle+(ratio*this.angleRange))
        }).endAngle((d,i)=>this._deg2rad(this.minAngle+this.threshholds[i]*this.angleRange))}_radius()
    {
        return(this.config.size-this.config.margin)/2}_deg2rad(deg)
    {return deg*Math.PI/180}render(container,newValue)
    {const svg=d3.select(container).append('svg')
        .attr('class','gauge')
        .attr('width',this.config.size+this.config.margin)
        .attr('height',this.config.size/2.7+this.config.margin);
    const arcs=svg.append('g').attr('class','arc')
        .attr('transform',`translate(${this._radius()},${this._radius()})`);
    arcs.selectAll('path')
        .data(this.threshholds)
        .enter()
        .append('path')
        .attr('fill',d=>this.colorScale(d-0.001))
        .attr('d',this.arc);
    const lg=svg.append('g')
        .attr('class','label')
        .attr('transform',`translate(${this._radius()},${this._radius()})`);
    lg.selectAll('text').data(this.ticks)
        .enter()
        .append('text')
        .attr('transform',d=>{var newAngle=this.minAngle+(this.scale(d)*this.angleRange);
        return `rotate(${ newAngle }) translate(0, ${this.labelInset-this._radius()})`}).text(d3.format('1.0f'));
    lg.selectAll('line').data(this.ticks).enter()
        .append('line')
        .attr('class','tickline')
        .attr('x1',0).attr('y1',0)
        .attr('x2',0).attr('y2',this.arcWidth+this.labelInset)
        .attr('transform',d=>{const newAngle=this.minAngle+(this.scale(d)*this.angleRange);
        return `rotate(${ newAngle }), translate(0, ${this.arcWidth-this.labelInset-this._radius()})`})
        .style('stroke','#666')
        .style('stroke-width','1px');
    const pg=svg.append('g')
        .data([this.lineData])
        .attr('class','pointer')
        .attr('transform',`translate(${this._radius()},${this._radius()})`);
    const pointer=pg.append('path')
        .attr('d',d3.line())
        .attr('transform',`rotate(${this.minAngle })`);
    const numberDiv=d3.select(container)
        .append('div')
        .attr('class','number-div')
        .style('width',`${this.config.size + 15 }px`);
    const numberUnit=numberDiv.append('span')
        .attr('class','number-unit')
        .text(d=>this.config.displayUnit);
    const numberValue=numberDiv.append('span')
        .data([newValue]).attr('class','number-value')
        .text(d=>d===undefined?0:d);
    this.pointer=pointer;
    this.numberValue=numberValue}update(newValue)
    {
        const newAngle=this.minAngle+(this.scale(newValue)*this.angleRange);
        this.pointer
            .transition()
            .duration(this.config.transitionMs)
        attr('transform',`rotate(${ newAngle })`);
        this.numberValue.data([newValue])
            .transition()
            .duration(this.config.transitionMs)
            .style('color',this.colorScale(this.scale(newValue)))
            .tween("",function(d){
                const interpolator=d3.interpolate(this.textContent,d);
                const that=this;return function(t)
                {
                    that.textContent=interpolator(t).toFixed(1)
                }
            })
    }
}

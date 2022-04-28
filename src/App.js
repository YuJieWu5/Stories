import React, { Component, useEffect, useState } from 'react';
import './App.css';
import StoryService from './service/story.service'
var classNames = require('classnames');

class App extends Component{
  constructor(props){
    super(props);
    this.state = {
        stories: [],
        slideLength: 0,
        currentSlide: 0,
        loading: true
    };
    this.start = null;
    this.stop = null;
    this.timeoutId = null;
    this.storyService = new StoryService();
    this.subjectMeta$ = this.storyService.subjectMeta.asObservable();
    this.subjectStory$ = this.storyService.subjectStory.asObservable();
    this.nextSlide = this.nextSlide.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
    this.showSlides = this.showSlides.bind(this);
    this.handlePaused = this.handlePaused.bind(this);
    this.handleRunning = this.handleRunning.bind(this);
    this.handleKeyboardDown = this.handleKeyboardDown.bind(this);
    this.handleKeyboardUp = this.handleKeyboardUp.bind(this);
  }

  componentDidMount(){
    this.storyService.getMeta();
    this.subjectMeta$.subscribe((data)=>{
      const idList = data['idList'];
      this.setState({slideLength: idList.length},async()=>{
        try{
          let count = 0;
          await idList.map((id)=>{
            this.storyService.getStory(id);
          })
          this.subjectStory$.subscribe((story)=>{
            this.setState({stories: [...this.state.stories, story]})
            count++;
            if(count == this.state.slideLength){
              this.setState({loading: false});
              document.getElementById("slider").focus();
              this.timeoutId = setTimeout(this.showSlides, this.state.stories[this.state.currentSlide]['duration']);
            }
              
          })
        }catch(e){
          console.log(e)
        }
      })
    })
  }

  nextSlide(){
    clearTimeout(this.timeoutId)
    this.setState({currentSlide: this.state.currentSlide === this.state.slideLength - 1 ? 0 : this.state.currentSlide + 1}, async()=>{
      this.timeoutId = setTimeout(this.showSlides, this.state.stories[this.state.currentSlide]['duration']);
    });
  };

  prevSlide(){
    clearTimeout(this.timeoutId)
    this.setState({currentSlide: this.state.currentSlide === 0 ? this.state.slideLength - 1 : this.state.currentSlide - 1},async()=>{
      this.timeoutId = setTimeout(this.showSlides, this.state.stories[this.state.currentSlide]['duration']);
    });
  };


  handlePaused(){
    let progress = document.getElementsByClassName("progress")[this.state.currentSlide]
    progress.style.animationPlayState = 'paused';
    clearTimeout(this.timeoutId)
    this.stop = new Date();
  }

  handleRunning(){
    let progress = document.getElementsByClassName("progress")[this.state.currentSlide]
    progress.style.animationPlayState = 'running';
    const delay = this.stop - this.start
    this.timeoutId = setTimeout(this.showSlides, this.state.stories[this.state.currentSlide]['duration']-delay);
  }
  
  handleKeyboardDown(e){
    if(e.keyCode === 32)
      this.handlePaused();
  }

  handleKeyboardUp(e){
    switch(e.keyCode){
      case 32:
        this.handleRunning();
        break;
      case 37:
        this.prevSlide();
        break;
      case 39:
        this.nextSlide();
        break;
    }
  }

  showSlides(){
    let i = this.state.currentSlide;
    if(i != this.state.slideLength-1){
      let current_story = document.getElementById(i);
      current_story.classList.remove('current');
      i++;
      this.setState({currentSlide: i}, async()=>{
        let next_story = document.getElementById(i);
        next_story.classList.add('current');
        this.timeoutId = setTimeout(this.showSlides, this.state.stories[this.state.currentSlide]['duration']);
        this.start = new Date();
      })
    }else{
      let last_progress = document.getElementById("progress-container").lastChild
      last_progress.classList.remove('active')
      last_progress.classList.add('passed')
    }
  }

  render(){
    return(
      <> 
        { this.state.loading ? (
          <div className="centered">
            <div className="spinner-grow" role="status">
              <span className="sr-only">Loading...</span>
            </div>
        </div>
        ):(
          <div className="slider" id="slider" tabIndex="0"
            onKeyDown={this.handleKeyboardDown}
            onKeyUp={this.handleKeyboardUp}>
            <div className="row arror-container">
                <button className="arrow col-md-6" onClick={this.prevSlide}></button>
                <button className="arrow col-md-6" onClick={this.nextSlide}></button>
            </div>
            
            
            <div id="progress-container" className="progress-container">
              {
                this.state.stories.length != 0 && this.state.stories.map((story, index)=>{
                  return(
                    <div
                      className={classNames({
                        "progress active": index === this.state.currentSlide,
                        "progress passed": index < this.state.currentSlide,
                        "progress": index > this.state.currentSlide
                      })}
                      style={{animationDuration:`${story['duration']/1000}s`}}
                    ></div>
                  )
                })
              }
            </div>
              {
                this.state.stories.length !=0 && this.state.stories.map((story, index)=>{
                  return(
                    <>
                      <div
                        id={index}
                        key={index}
                        tabIndex="0"
                        className={index === this.state.currentSlide ? "slide current" : "slide"}
                        onMouseDown={this.handlePaused}
                        onTouchStart={this.handlePaused}
                        onMouseUp={this.handleRunning}
                        onTouchEnd={this.handleRunning}
                        
                        >
                          <img className="image-size" src={story['imageUrl']}/>
                          <div className="text">{story['text']}</div>
                      </div>
                    </>
                  )
                })
              }
          </div>
        )}
      </>
    )
  }
}
export default App;
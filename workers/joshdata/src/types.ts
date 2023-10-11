export type Injest_Type = 'social_post'|'social_post_image'
export type Injest_Stage = 'save'|'classify';
export type Injest_Direction = 'backwards'|'forwards';
export type Injest_Message = {
    direction: Injest_Direction;
	network:string;
	instanceUrl:string;
	accountId:string;
	type: Injest_Type;
    stage: Injest_Stage;
}
